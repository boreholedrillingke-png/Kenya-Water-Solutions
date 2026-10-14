import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// Table is created on first use, so no manual database step is needed.
let ready: Promise<unknown> | null = null;
function ensureTable() {
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS video_comments (
      id SERIAL PRIMARY KEY,
      video_id TEXT NOT NULL,
      name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS video_comments_video_idx ON video_comments (video_id, created_at DESC);
  `).catch((e) => { ready = null; throw e; });
  return ready;
}

// Admin = anyone who sends the ADMIN_KEY set on the server. If ADMIN_KEY is not set, nobody is admin.
const isAdmin = (key: unknown) => {
  const k = process.env.ADMIN_KEY;
  return !!k && typeof key === "string" && key === k;
};

// Simple per-IP limit: 6 comments per minute.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= 6) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  return false;
}

router.get("/video-comments/counts", async (_req, res) => {
  try {
    await ensureTable();
    const r = await pool.query("SELECT video_id, COUNT(*)::int AS n FROM video_comments GROUP BY video_id");
    res.json(Object.fromEntries(r.rows.map((x) => [x.video_id, x.n])));
  } catch { res.json({}); }
});

router.post("/video-comments/admin-check", (req, res) => {
  res.json({ admin: isAdmin(req.header("x-admin-key")) });
});

// Admin: latest comments across all videos, for moderating in one place
router.get("/video-comments-admin/recent", async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  try {
    await ensureTable();
    const r = await pool.query("SELECT id, video_id AS \"videoId\", name, body, created_at AS \"createdAt\" FROM video_comments ORDER BY created_at DESC LIMIT 100");
    res.json(r.rows);
  } catch { res.status(500).json({ error: "Could not load comments" }); }
});

router.get("/video-comments/:videoId", async (req, res) => {
  try {
    await ensureTable();
    const r = await pool.query(
      "SELECT id, name, body, created_at AS \"createdAt\" FROM video_comments WHERE video_id = $1 ORDER BY created_at DESC LIMIT 200",
      [req.params.videoId.slice(0, 120)],
    );
    res.json(r.rows);
  } catch { res.status(500).json({ error: "Could not load comments" }); }
});

router.post("/video-comments/:videoId", async (req, res) => {
  const name = String(req.body?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 40) || "Guest";
  const body = String(req.body?.body ?? "").trim().slice(0, 300);
  if (!body) { res.status(400).json({ error: "Write a comment first" }); return; }
  if (limited(req.ip ?? "unknown")) { res.status(429).json({ error: "Too many comments, please wait a minute" }); return; }
  try {
    await ensureTable();
    const r = await pool.query(
      "INSERT INTO video_comments (video_id, name, body) VALUES ($1, $2, $3) RETURNING id, name, body, created_at AS \"createdAt\"",
      [req.params.videoId.slice(0, 120), name, body],
    );
    res.status(201).json(r.rows[0]);
  } catch { res.status(500).json({ error: "Could not save comment" }); }
});

router.delete("/video-comments/:id", async (req, res) => {
  if (!isAdmin(req.header("x-admin-key"))) { res.status(403).json({ error: "Admin only" }); return; }
  try {
    await ensureTable();
    await pool.query("DELETE FROM video_comments WHERE id = $1", [Number(req.params.id) || 0]);
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Could not delete" }); }
});

export default router;
