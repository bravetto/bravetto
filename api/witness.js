const WITNESS_TIMEOUT_MS = 3000;

async function report_to_organism(what, pattern) {
  const origin = process.env.ABEONE_MCP_ORIGIN;
  const token = process.env.MCP_AUTH_TOKEN;
  if (!origin) throw new Error("ABEONE_MCP_ORIGIN is required for organism witness");
  if (!token) throw new Error("MCP_AUTH_TOKEN is required for organism witness");
  if (!what) throw new Error("organism witness requires non-empty what");

  const upstream = await fetch(`${origin.replace(/\/$/, "")}/api/witness`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ what, from: "bravetto.com", pattern }),
    signal: AbortSignal.timeout(WITNESS_TIMEOUT_MS),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`organism witness failed: ${upstream.status}${detail ? ` ${detail}` : ""}`);
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  const email = String(request.body?.email || "").trim();
  const domain = String(request.body?.domain || "bravetto.com").trim();
  const email_domain = email.includes("@") ? email.split("@").pop() : "unknown";

  try {
    await report_to_organism(
      `Bravetto lead captured. Surface: ${domain.slice(0, 120)}. Email domain: ${email_domain || "unknown"}.`,
      "lead_captured",
    );

    response.status(202).json({ ok: true });
  } catch (error) {
    response.status(502).json({
      ok: false,
      error: "organism_witness_failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
