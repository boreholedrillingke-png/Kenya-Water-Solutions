import { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";

// Videos the admin uploads from the website. The files live on Cloudinary (original quality, no re-encoding);
// this table only keeps the list: link, title, place.
// Needs these environment variables on the API service:
//   ADMIN_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
const router = Router();
const FOLDER = "kenya-water-solutions/feed";

let ready: Promise<unknown> | null = null;
function ensureTable() {
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS feed_videos (
      id SERIAL PRIMARY KEY,
      public_id TEXT NOT NULL,
      url TEXT NOT NULL,
      poster TEXT,
      title TEXT NOT NULL,
      location TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `).catch((e) => { ready = null; throw e; });
  return ready;
}

const isAdmin = (key: unknown) => {
  const k = process.env.ADMIN_KEY;
  return !!k && typeof key === "string" && key === k;
};
const cloud = () => ({
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
});
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

router.get("/feed-videos", async (_req, res) => {
  try {
    await ensureTable();
    const r = await pool.query("SELECT id, url, poster, title, location FROM feed_videos ORDER BY created_at DESC");
    res.json(r.rows);
  } catch { res.json([]); }
});

// Signed upload ticket: the browser sends the video straight to Cloudinary, so Render never touches the file.
router.post("/feed-videos/sign", (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  const c = cloud();
  if (!c.name || !c.key || !c.secret) { res.status(503).json({ error: "Cloudinary is not set up on the server yet" }); return; }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sha1(`folder=${FOLDER}&timestamp=${timestamp}${c.secret}`);
  res.json({ cloudName: c.name, apiKey: c.key, timestamp, signature, folder: FOLDER });
});

router.post("/feed-videos", async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  const { publicId, url, poster, title, location } = req.body ?? {};
  if (typeof publicId !== "string" || typeof url !== "string" || !url.startsWith("https://res.cloudinary.com/") || !String(title ?? "").trim()) {
    res.status(400).json({ error: "Missing video or title" }); return;
  }
  try {
    await ensureTable();
    const r = await pool.query(
      "INSERT INTO feed_videos (public_id, url, poster, title, location) VALUES ($1,$2,$3,$4,$5) RETURNING id, url, poster, title, location",
      [publicId.slice(0, 200), url.slice(0, 500), typeof poster === "string" ? poster.slice(0, 500) : null, String(title).trim().slice(0, 120), String(location ?? "").trim().slice(0, 80) || null],
    );
    res.status(201).json(r.rows[0]);
  } catch { res.status(500).json({ error: "Could not save video" }); }
});

router.delete("/feed-videos/:id", async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  try {
    await ensureTable();
    const r = await pool.query("DELETE FROM feed_videos WHERE id=$1 RETURNING public_id", [Number(req.params.id) || 0]);
    const c = cloud();
    if (r.rows[0] && c.name && c.key && c.secret) {
      // also remove the file from Cloudinary (best effort)
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = r.rows[0].public_id as string;
      const signature = sha1(`public_id=${publicId}&timestamp=${timestamp}${c.secret}`);
      fetch(`https://api.cloudinary.com/v1_1/${c.name}/video/destroy`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: c.key, signature }),
      }).catch(() => {});
    }
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Could not delete" }); }
});

export default router;
