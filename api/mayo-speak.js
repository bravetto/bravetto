const VOICE_URL = "https://voice.bravetto.ai/speak";
const MAX_TEXT_LENGTH = 900;

function allowed_origin(origin) {
  if (!origin) return false;
  if (origin === "https://bravetto.com" || origin === "https://www.bravetto.com") return true;
  return /^https:\/\/bravetto-[a-z0-9-]+-bravetto\.vercel\.app$/.test(origin);
}

function local_dev_origin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const is_local_dev = process.env.NODE_ENV !== "production" && local_dev_origin(origin);
  if (allowed_origin(origin) || is_local_dev) {
    res.setHeader("access-control-allow-origin", origin);
  }
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  res.setHeader("vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });
  if (!allowed_origin(origin) && !is_local_dev) return res.status(403).json({ error: "origin not allowed" });

  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "text required" });
  if (text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: "text too long" });

  const upstream = await fetch(VOICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice: "abe",
      model: "flash",
      persona: "bravetto",
    }),
  });

  if (!upstream.ok) {
    return res.status(502).json({ error: "canonical voice unavailable" });
  }

  const audio = Buffer.from(await upstream.arrayBuffer());
  res.setHeader("content-type", upstream.headers.get("content-type") || "audio/mpeg");
  res.setHeader("cache-control", "no-store");
  return res.status(200).send(audio);
}
