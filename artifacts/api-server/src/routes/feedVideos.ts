import express, { Router } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";

// Videos the admin uploads from the website. The files live on Cloudinary (original quality, no re-encoding);
// this table only keeps the list: link, title, place.
// Storage (pick one, GitHub wins if both are set). Env variables on the API service:
//   ADMIN_KEY                                                    always needed
//   CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET               store videos on Cloudinary (preferred when set)
//   GITHUB_TOKEN (+ optional GITHUB_REPO, GITHUB_BRANCH)          otherwise store them in the GitHub repo, original file
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
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      source TEXT NOT NULL DEFAULT 'cloudinary'
    );
    ALTER TABLE feed_videos ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'cloudinary';
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
const gh = {
  get token() { return process.env.GITHUB_TOKEN; },
  get repo() { return process.env.GITHUB_REPO || "boreholedrillingke-png/Kenya-Water-Solutions"; },
  get branch() { return process.env.GITHUB_BRANCH || "main"; },
};
const GH_DIR = "artifacts/borehole-kenya/public/videos/uploads";
const ghFetch = (path: string, init: RequestInit = {}) =>
  fetch(`https://api.github.com/repos/${gh.repo}/contents/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${gh.token}`, Accept: "application/vnd.github+json", "User-Agent": "kenya-water-solutions", ...(init.headers ?? {}) },
  });
const sha1 = (s: string) => crypto.createHash("sha1").update(s).digest("hex");

router.get("/feed-videos", async (_req, res) => {
  try {
    await ensureTable();
    const r = await pool.query("SELECT id, url, poster, title, location, source, created_at AS \"createdAt\" FROM feed_videos ORDER BY created_at DESC");
    res.json(r.rows);
  } catch { res.json([]); }
});

// Signed upload ticket: the browser sends the video straight to Cloudinary, so Render never touches the file.
router.post("/feed-videos/sign", (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  const c = cloud();
  const cloudReady = !!(c.name && c.key && c.secret);
  // Cloudinary is preferred when its keys are set (bigger files, faster, nothing to rebuild).
  // GitHub is used only when Cloudinary is not set up.
  if (!cloudReady) {
    if (gh.token) { res.json({ mode: "github", maxMB: 90 }); return; }
    res.status(503).json({ error: "No video storage is set up on the server yet (add the three Cloudinary keys on Render)" });
    return;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sha1(`folder=${FOLDER}&timestamp=${timestamp}${c.secret}`);
  res.json({ mode: "cloudinary", cloudName: c.name, apiKey: c.key, timestamp, signature, folder: FOLDER });
});

// GitHub mode: the browser sends the original file here and we commit it to the repo untouched.
router.post("/feed-videos/upload", express.raw({ type: () => true, limit: "90mb" }), async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  if (!gh.token) { res.status(503).json({ error: "GITHUB_TOKEN is not set on the server" }); return; }
  const ext = (String(req.query.name ?? "").match(/\.(mp4|webm)$/i)?.[1] ?? "").toLowerCase();
  const title = String(req.query.title ?? "").trim().slice(0, 120);
  const location = String(req.query.location ?? "").trim().slice(0, 80);
  if (!ext) { res.status(400).json({ error: "Please upload an .mp4 or .webm video" }); return; }
  if (!title) { res.status(400).json({ error: "Missing title" }); return; }
  if (!Buffer.isBuffer(req.body) || req.body.length < 1000) { res.status(400).json({ error: "Empty file" }); return; }
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";
  const fileName = `${slug}-${Date.now()}.${ext}`;
  try {
    await ensureTable();
    const put = await ghFetch(`${GH_DIR}/${fileName}`, {
      method: "PUT",
      body: JSON.stringify({ message: `Add video: ${title}`, content: req.body.toString("base64"), branch: gh.branch }),
    });
    if (!put.ok) { res.status(502).json({ error: `GitHub refused the upload (${put.status}). Check the token has write access to the repo.` }); return; }
    const r = await pool.query(
      "INSERT INTO feed_videos (public_id, url, poster, title, location, source) VALUES ($1,$2,NULL,$3,$4,'github') RETURNING id, url, poster, title, location, source, created_at AS \"createdAt\"",
      [`${GH_DIR}/${fileName}`, `videos/uploads/${fileName}`, title, location || null],
    );
    res.status(201).json(r.rows[0]);
  } catch { res.status(500).json({ error: "Could not save video" }); }
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
      "INSERT INTO feed_videos (public_id, url, poster, title, location) VALUES ($1,$2,$3,$4,$5) RETURNING id, url, poster, title, location, source, created_at AS \"createdAt\"",
      [publicId.slice(0, 200), url.slice(0, 500), typeof poster === "string" ? poster.slice(0, 500) : null, String(title).trim().slice(0, 120), String(location ?? "").trim().slice(0, 80) || null],
    );
    res.status(201).json(r.rows[0]);
  } catch { res.status(500).json({ error: "Could not save video" }); }
});

router.delete("/feed-videos/:id", async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  try {
    await ensureTable();
    const r = await pool.query("DELETE FROM feed_videos WHERE id=$1 RETURNING public_id, source", [Number(req.params.id) || 0]);
    const c = cloud();
    if (r.rows[0]?.source === "github" && gh.token) {
      // remove the file from the repo too (best effort)
      const path = r.rows[0].public_id as string;
      ghFetch(`${path}?ref=${gh.branch}`).then((g) => g.json()).then((g: { sha?: string }) => {
        if (g.sha) ghFetch(path, { method: "DELETE", body: JSON.stringify({ message: "Remove video", sha: g.sha, branch: gh.branch }) }).catch(() => {});
      }).catch(() => {});
    } else if (r.rows[0] && c.name && c.key && c.secret) {
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
