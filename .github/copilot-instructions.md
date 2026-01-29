# Copilot instructions for Bravètto 🔧

## Quick project summary

- Static marketing/docs site and product artifacts (vanilla HTML + Tailwind + p5.js). Hosted on **Vercel** (see `vercel.json`).
- Key areas:
  - `index.html` — landing / Living Canvas (p5.js).
  - `/abeone` — platform & architecture overview (HUMAN → INTERFACE → APPLICATION → MCP BRIDGE → MYCELIAL NETWORK).
  - `/biasguard` — VS Code extension landing + install flow (`.vsix`).
  - `/north-shore-voice` — vertical product (Guardian + Compliance Guard).
  - `/davinci-notebook` — voice training notebooks and `TRAINING_GUIDE.md`.
  - `/scream-machine` — large research submodule (Python package, examples, docs).
  - `/lab-archive` — historical experiments (archive, do not delete).

---

## Essential developer workflows ✅

- Local static preview: `python3 -m http.server 8000` and open the page (works for any folder).
- Vercel local preview: `npx vercel dev` (mirrors rewrites in `vercel.json`).
- Sync submodules carefully: `./scripts/update-submodules.sh` (supports `--no-pull`).
- Scream Machine (submodule): use Python 3.9+; see `scream-machine/README.md`, `requirements.txt`, `examples/demo.py`, and `launch.sh`. Typical setup:
  - python3 -m venv .venv && . .venv/bin/activate
  - pip install -r scream-machine/requirements.txt
  - run `examples/demo.py` or `python -m scream_machine` per README.
- BiasGuard install example (user-facing): `curl -sL https://bravetto.com/biasguard/biasguard-4.3.1.vsix -o /tmp/bg.vsix && code --install-extension /tmp/bg.vsix` (see `biasguard/index.html`).

---

## Project-specific patterns & conventions 🧭

- Minimal stack: prefer small, targeted changes to static HTML/CSS. No React/complex bundling unless explicitly added.
- Styling: Tailwind via CDN; each page may extend `tailwind.config` inline—preserve named color tokens (`cream`, `gold`, `ink`, `guard-green`, etc.).
- Living Canvas: p5.js animation is expected across pages (`#living-canvas`). When updating visuals, keep pointer-events:none and non-blocking performance.
- Branding & safety: Keep `Guardian`, `Compliance Guard`, and `Zero State` semantics intact for client-facing workflows.
- File archival: Move legacy or experimental work to `/lab-archive` (don't delete historical docs).

---

## Integration & deployment notes 🔗

- `vercel.json` contains rewrites for clean URLs (`/abeone` => `/abeone/index.html`, etc.). Update rewrites if you add new top-level pages.
- Submodules are treated as external packages (e.g., `scream-machine`). Use `scripts/update-submodules.sh` to keep them in sync; avoid force-pushes that change history without coordination.
- `davinci-notebook` expects Colab/Colab GPU workflow. Read `TRAINING_GUIDE.md` and `PHILOSOPHY.md` for domain guidance before modifying training code.

---

## Files to read first 📚

- `index.html`, `abeone/index.html` (architecture & UI patterns)
- `vercel.json` (deployment rewrites)
- `scripts/update-submodules.sh` (submodule rules)
- `scream-machine/README.md` and `scream-machine/docs/ARCHITECTURE.md` (Python package, demos)
- `davinci-notebook/TRAINING_GUIDE.md` and `PHILOSOPHY.md` (domain-specific expectations)
- `biasguard/index.html` (install UX and messaging)

---

## How AI agents should behave when editing 🤖

- Make minimal, targeted changes to static content—small PRs with clear descriptions.
- Preserve visual identity (fonts, color tokens, Living Canvas) and safety copy (Guardian/Compliance).
- For any behavioral change (JS), include a short manual test plan in PR description (what to click, expected result).
- When touching `scream-machine`, document environment, exact Python commands, and example input/outputs in the PR.
- Prefer moving old experiments to `/lab-archive` rather than deleting.

---

If you'd like changes to the scope (e.g., an added checklist for PRs, or a brief developer test matrix), tell me which area to expand and I will iterate. ✅
