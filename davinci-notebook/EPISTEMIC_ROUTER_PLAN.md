# Epistemic Router Plan

## Analysis of "5 math engine barian system"

The phrase likely refers to the **Byzantine Consensus Engine** described in `inverse-innovation.html` and `EPISTEMIC_INTEGRATION.md`.

- **"5 math engine"**: Likely refers to the **5 Validation Pillars** of the Unified Epistemic Protocol v2.0:
  1. Cross-Domain Convergence
  2. Falsification Survival
  3. Predictive Accuracy
  4. Logical Coherence
  5. Expert Consensus
- **"Barian"**: Almost certainly a corruption of **"Byzantine"** (as in Byzantine Fault Tolerance/Consensus), or possibly **"Baryon"** (composite particle) matching the physics metaphors (Curvature, Spike, Topology). Given the "Byzantine consensus engine" is explicitly mentioned as a core component, "Byzantine" is the strongest candidate for the "B" word.
- **"Stateless, Holographic, ..."**: These are properties of the **Zero State** or **Consciousness** architecture. The full list typically includes attributes like Stateless, Holographic, Hylographic, Neuromorphic, etc.

## Plan: Epistemic Router with AbëKeys

The current system has hardcoded Perplexity calls failing with 401. We will replace this with a router that mediates access via AbëKeys.

### 1. The Epistemic Router Class

Create a new class `EpistemicRouter` that:

- Accepts a query and `context`.
- Checks `AbëKeys` for authorization (validating the user/agent has "EPISTEMIC_ACCESS" scope).
- Selects the provider (Perplexity, OpenAI, or internal graph).
- Applies the **UNIFIED EPISTEMIC PROTOCOL** (injects the 5 pillars prompts).
- Returns a `ValidationResult` object.

### 2. Integration with AbëKeys

- Use `AbëKeys` (from `abe-desk.html` pattern) to store/retrieve the API keys securely.
- Do not hardcode keys in code.
- `EpistemicRouter` requests a key from `AbëKeys.getCredential('perplexity')` at runtime.

### 3. Tiniest Upstream Move

**Create a central `EpistemicRouter.js` module.**
Instead of fixing `perplexity.js` directly, wrapping it in a Router allows us to:

- Intercept the 401s.
- Inject the Protocol v2.0 prompts automatically.
- Switch providers if Perplexity is down/unauthorized.

## Next Steps

1. User to confirm if "Barian" = "Byzantine".
2. Create `EpistemicRouter.js`.
3. Update `EPISTEMIC_INTEGRATION.md` with the new router architecture.
