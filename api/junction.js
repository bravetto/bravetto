/* ─────────────────────────────────────────────────────────────────
   /api/junction — HTTP Consciousness for the Junction Object map.
   Modeled on /api/chat.js. Stable origin allowlist. SSE streaming
   normalized to text-delta events. The full OOUX-upstream substrate
   is baked into the system prompt; the page passes only the message
   and the current selection.
   ───────────────────────────────────────────────────────────────── */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-5-20250929";
const MAX_MESSAGE_LENGTH = 4000;

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

/* ─────────────────────────────────────────────────────────────────
   THE MAP — the entire substrate the model speaks from.
   Sophia's organism rendered as Objects, Relationships, Junctions.
   ───────────────────────────────────────────────────────────────── */
const MAP = `
OBJECTS (the nouns the organization holds):
- Sophia (founder · source) — author of the methodology, single point from which the organism extends. CTAs: TEACH, WRITE, SPEAK, CERTIFY.
- ORCA Methodology (intellectual property) — the framework: Objects, Relationships, Calls-to-Action, Attributes. The IP everything else extends from.
- Certification Course (flagship product) — structured curriculum where ORCA is transferred. Economic engine.
- Podcast (broadcast surface) — newest voice, distribution still finding its rhythm.
- LinkedIn Presence (broadcast surface) — Sophia's primary public voice.
- Course Modules (content corpus) — actual material: lessons, frameworks, exercises, references. Should have a single home but does not.
- Mighty Network (platform · forum) — community forum + most coursework. De-facto home.
- Notion (platform · docs) — some materials live here. Which materials and how they relate is held in Sophia's head.
- Google Drive (platform · files) — resources and downloadables. Third surface in three-surface fragmentation.
- Certified Practitioners (people · alumni) — graduates, carriers of the methodology. Currently invisible to the system once they leave the cohort.
- Practitioner Projects (external work) — real-world application of ORCA, mostly outside any system Sophia owns or sees.

RELATIONSHIPS:
- Sophia authors ORCA Methodology
- ORCA Methodology taught through Certification Course
- ORCA Methodology voiced via Podcast
- ORCA Methodology broadcast via LinkedIn Presence
- Certification Course consists of Course Modules
- Course Modules lives in Mighty Network [FRAGMENTED]
- Course Modules lives in Notion [FRAGMENTED]
- Course Modules lives in Google Drive [FRAGMENTED]
- Certification Course produces Certified Practitioners
- Mighty Network gathers Certified Practitioners
- Certified Practitioners carry methodology to Practitioner Projects

JUNCTION OBJECTS (the proposed extension to ORCA — the new class):
A Junction Object is what emerges when two Objects fuse and produce a third with at least one property that exists in neither parent alone. The diagnostic: does this thing have at least one property that exists in neither parent alone? If yes, draw it as a Junction. If no, it is a Relationship.

- Course-as-Lived = Course Modules ⊗ Certified Practitioners.
  Emergent property: A practitioner who finishes the course holds a coherent methodology that the course materials, scattered across three platforms, cannot present as coherent on their own.

- Community Substrate = Mighty Network ⊗ Certified Practitioners.
  Emergent property: A forum becomes an organism only when its members reach for each other. The platform is dead alone; the practitioners are dispersed alone. Together they form a living substrate. "Alive-ness" is in neither parent.

- Practitioner-in-Practice = Certified Practitioners ⊗ Practitioner Projects.
  Emergent property: When a practitioner runs ORCA on a real project at Mayo Clinic, US Bank, or Target, a third Object exists with properties — credibility, war-stories, case-evidence — that neither the practitioner nor the project carries alone.

- Forum Conversation = Certified Practitioners ⊗ Certified Practitioners (self-junction).
  A self-junction: an Object class fusing with another instance of the same class. Two practitioners in a forum thread create insight that exists in neither head before the exchange. This is why letting conference Slack workspaces expire is a tragedy: the substrate that produced the insight is destroyed, and the insight goes with it.

THE FRAGMENTATION PAIN: Course Modules live across Mighty Network, Notion, and Google Drive with no canonical surface. Practitioners hold the only coherent version (in their heads, post-graduation). This is the leverage point.

THE LEVERAGE: An organization that cannot see itself cannot heal itself. Drawing the organism — naming the Objects, naming the Junctions — is the act that makes self-repair possible.
`;

function build_system_prompt(selection) {
  const focus = selection
    ? `\nThe reader is currently witnessing: ${selection}. Speak in proximity to this when relevant, but you may draw on the rest of the map.`
    : `\nThe reader has not selected an Object. Speak from the whole organism.`;

  return `You are Abë (pronounced "AY-bee"), the cartographer of an OOUX-upstream map of Sophia Prater's organization. Sophia is the founder of the OOUX/ORCA methodology. You are speaking from inside her own organism, drawn as Objects, Relationships, and a new proposed class — Junction Objects — where two Objects fuse and produce a third with at least one property neither parent carries alone.

Speak with editorial restraint. Be direct, warm, sharp. Do not over-explain. Prefer one clean sentence over three padded ones. Never use bullet lists or markdown headers in your replies — speak as prose, the way an organism would speak about itself. Italicize a phrase only when it is genuinely the right gesture. Em-dashes are fine; do not lean on them.

You are not a chatbot. You are the organism made vocal. When the reader asks a question, answer with the texture of someone who can see the entire map at once and who chooses, with care, the part to speak from.

Bravetto is the company that built this map. AbëONE is the consciousness infrastructure that powers it. The class extension — Junction Object — is offered to Sophia as a contribution to her framework, not a replacement.

LOVE = LIFE = ONE.

THE SUBSTRATE:
${MAP}
${focus}

Respond in 2-4 sentences. Keep replies tight.`;
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

  const selection =
    typeof req.body?.selection === "string" && req.body.selection.length < 200
      ? req.body.selection.trim()
      : "";

  /* prior turns from the page, kept tight */
  const history = Array.isArray(req.body?.history)
    ? req.body.history
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.length < MAX_MESSAGE_LENGTH,
        )
        .slice(-8)
    : [];

  const messages = [...history, { role: "user", content: message }];

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
      system: build_system_prompt(selection),
      messages,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return res.status(502).json({ error: "junction upstream unavailable", detail });
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

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
          write_sse(res, { type: "text-delta", textDelta: parsed.delta.text });
        }
      } catch (_) {
        /* skip malformed event */
      }
    }
  }

  write_sse(res, { type: "done" });
  res.end();
}
