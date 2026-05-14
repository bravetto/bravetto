import { createHash } from "node:crypto";

const ALLOWED_ORIGINS = [
  "https://bravetto.com",
  "https://www.bravetto.com",
];

function sha256(value) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

async function insert_lead({ email, name, domain, message }) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("supabase env missing");
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      email,
      name: name || "",
      domain: domain || "bravetto.com/sales",
      message: message || "",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`supabase insert failed: ${detail}`);
  }
}

async function fire_capi({ email, source_url }) {
  if (!process.env.FB_PIXEL_ID || !process.env.FB_ACCESS_TOKEN) return;

  try {
    await fetch(`https://graph.facebook.com/v19.0/${process.env.FB_PIXEL_ID}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Lead",
            event_time: Math.floor(Date.now() / 1000),
            event_source_url: source_url || "https://bravetto.com/sales",
            action_source: "website",
            user_data: { em: [sha256(email)] },
          },
        ],
        access_token: process.env.FB_ACCESS_TOKEN,
      }),
    });
  } catch (error) {
    console.error("[lead] capi fire failed:", error.message);
  }
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const is_allowed =
    ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production";

  if (is_allowed) res.setHeader("access-control-allow-origin", origin);
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
  res.setHeader("vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!is_allowed) return res.status(403).json({ error: "origin_not_allowed" });

  const { email, name, domain, message } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "valid_email_required" });
  }

  try {
    await insert_lead({ email, name, domain, message });
    await fire_capi({ email, source_url: req.headers.referer });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[lead] error:", error.message);
    return res.status(500).json({ error: "lead_capture_failed" });
  }
}
