import fs from "node:fs";
import path from "node:path";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";
const MAX_MESSAGE_LENGTH = 4000;
const product = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "product.json"), "utf8"),
);

function allowed_origin(origin) {
  if (!origin) return false;
  if (origin === "https://bravetto.com" || origin === "https://www.bravetto.com") return true;
  return /^https:\/\/bravetto-[a-z0-9-]+-bravetto\.vercel\.app$/.test(origin);
}

function local_dev_origin(origin) {
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
}

function write_sse(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function build_system_prompt() {
  const voice_id = product.voice?.id ? `Voice identity: ${product.voice.id}.` : "";
  return [product.systemPrompt, voice_id].filter(Boolean).join("\n");
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
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "anthropic api key not configured" });
  }

  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : typeof req.body?.text === "string"
        ? req.body.text.trim()
        : "";
  if (!message) return res.status(400).json({ error: "message required" });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: "message too long" });
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      stream: true,
      system: build_system_prompt(),
      messages: [{ role: "user", content: message }],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return res.status(502).json({ error: "chat upstream unavailable", detail });
  }

  res.setHeader("content-type", "text/event-stream; charset=utf-8");
  res.setHeader("cache-control", "no-cache, no-transform");
  res.setHeader("connection", "keep-alive");

  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of upstream.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("\n");
      if (!data || data === "[DONE]") continue;

      const parsed = JSON.parse(data);
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
        write_sse(res, { type: "text-delta", textDelta: parsed.delta.text });
      }
    }
  }

  write_sse(res, { type: "done" });
  res.end();
}
