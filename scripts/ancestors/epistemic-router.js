// EpistemicRouter.js
// Central nervous system for truth validation and key injection.
// Implements the "5 Math Engine" (Validation Pillars) and standardizes AbeKEYs.

const path = require("path");
const { execSync } = require("child_process");

const KEYS_CORE = path.join(process.env.HOME, "repos/cores/keys-core");

class EpistemicRouter {
  constructor() {
    this.protocol = {
      pillars: [
        "Cross-Domain Convergence",
        "Falsification Survival",
        "Predictive Accuracy",
        "Logical Coherence",
        "Expert Consensus",
      ],
      baryon: "Byzantine Consensus Engine",
    };
  }

  /**
   * standardized abekeys injection.
   * priority: 1. environment variable (production/vercel) -> 2. keys-core (local dev)
   */
  getSecret(service) {
    const envKey = service.toUpperCase() + "_API_KEY";
    if (process.env[envKey]) return process.env[envKey];

    try {
      const result = execSync(
        `node ${KEYS_CORE}/get-secret.cjs ${service} --raw 2>/dev/null`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
      );
      const raw = result.trim();
      const match = raw.match(/(?:value|api_key):\s*(\S+)/);
      if (match) return match[1];
      if (raw.length > 10) return raw;
    } catch (e) {
      // keys-core not available
    }

    return null;
  }

  /**
   * Validates a query against the 5 Pillars using the available provider.
   */
  async validate(query, context = {}) {
    const apiKey = this.getSecret("openai");
    if (!apiKey) {
      console.warn("[EPISTEMIC] no openai key available — returning unvalidated");
      return { validated: false, entropy: 1.0, reason: "no api key" };
    }

    const prompt = `
[SYSTEM: UNIFIED EPISTEMIC PROTOCOL v2.0]
ALIGNMENT: ${this.protocol.baryon}
PILLARS: ${this.protocol.pillars.join(", ")}

QUERY: ${query}

TASK: Validate the above query against the 5 Pillars. 
    Output structured JSON: { 
      "coherence": 0-1, 
      "falsification": "...", 
      "consensus": "...",
      "entropy": 0-1 (Information Theory metric of uncertainty)
    }
        `.trim();

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [{ role: "system", content: prompt }], // Zero-shot validation
            temperature: 0.2, // Low entropy for high truth
            response_format: { type: "json_object" },
          }),
        },
      );
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("[EPISTEMIC ROUTER ERROR]", e.message);
      return { status: "Validation Failed", error: e.message };
    }
  }
}

module.exports = new EpistemicRouter();
