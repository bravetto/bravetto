# Bravetto.com — Positioning, Sitemap, and the Artifact Pattern
*Drawn for the rebuild · May 9, 2026*

---

## I. What is true on the site today

**Observed (read end-to-end from the repo):**

The site has a coherent thesis already. The home page (`/`) is a *front door*, not a marketing page — Abë introduces herself as a mirror, not a doctor. Three layers are always visible: breath (her pulse), voice (the encounter), work (her nervous system). The door leads to `/welcome` and a $1/day Stripe checkout for the consciousness-mcp.

The current routes fall into seven categories that the site does not yet name out loud:

1. **The Front Door** — `/`, `/talk`, `/welcome`
2. **The AEC Stack** — `/aec`, `/aec-proposal`, `/aec-one-pattern`, `/aec-roi`, `/aec-demo`, `/aec-paperwork`, `/aec-experience`, `/the-room` (the active enterprise deal)
3. **The Products** — `/abeone`, `/biasguard`, `/north-shore-voice`, `/abekeys`, `/abevoice`, `/abe-desk`
4. **The Method** — `/how-we-build`, `/inverse-innovation`, `/neuromorphic`, `/living-canvas`, `/membrane`, `/convergence`, `/angel-in-the-marble`
5. **The Vault** — `/vault`, `/domains`, `/brand-kit`, `/davinci-notebook`
6. **The Lab Archive** — `/experiments`, `/pimp-my-mac`, `/scream-machine`
7. **Operational** — `/welcome`, `/products` (pricing), `/sales`, `/command`, `/war-room`, `/gate`

**What is not here yet:** a home for **Artifacts** — pages built for a specific person, demonstrating a piece of thinking, that the recipient can experience as a living thing rather than read as marketing. `/junction` is the first instance.

---

## II. The Artifact pattern (named)

An **Artifact** is a page on bravetto.com with these properties:

- **Built for a named recipient** — Sophia for `/junction`, future names for future Artifacts. The recipient is the audience even though the page is public.
- **Demonstrates a thought, not a product** — the page is the proof, not the pitch. If it sells anything, it sells the thinking by demonstrating it.
- **Living and speakable** — Abë is wired in, the page can be conversed with, and the conversation deepens the reader's contact with the idea.
- **Editorial, not promotional** — Cormorant Garamond + Instrument Sans, plate-style cartography, prologue/map/epilogue rhythm. Not Tailwind grids and CTAs.
- **Sub-perceptual substrate** — every Artifact runs a generative background (the Junction Drift particles for `/junction`) at low opacity; the substrate enacts the page's claim.
- **One canonical URL, no nav surfacing** — Artifacts are sent, not browsed-to. They do not need to be in the main nav. They earn discovery by being shared.

This is the rule for every future Artifact:

> *An Artifact is a thing you make for one person and put on the internet so that other people who become like that person can find it.*

---

## III. Recalculated sitemap

The site needs an **Artifacts** category at priority 0.6 (discoverable but not central). New `sitemap.xml` adds:

```xml
<url>
  <loc>https://bravetto.com/junction</loc>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

Future Artifacts follow the same pattern: `bravetto.com/<artifact-slug>`. Slug is the *concept*, not the recipient — `/junction` (the class), not `/sophia`. The recipient is named in the Artifact's masthead colophon.

Working slugs already imaginable:
- `/junction` — *for Sophia* (live)
- `/content-organism` — *for Angie* (the content-governance OOUX-upstream map at Mayo)
- `/conference-substrate` — *for Amy and Sean at Button* (the Slack-doesn't-have-to-die argument)

---

## IV. The Artifact production process

Six gates, each one optional to skip but each one defended:

1. **Wave** — A real conversation produces a real insight. The Artifact begins as a wave between two humans, not as a marketing brief. (The transcript Angie sent was the wave for `/junction`.)
2. **Class** — The wave is named. For `/junction`, the class was the Junction Object. Naming is the act that makes the thinking transferrable.
3. **Map** — The class is rendered. SVG cartography, not slide deck. The diagram has its own legend, its own typographic rhythm, its own annotations.
4. **Substrate** — A generative background that enacts the class at sub-perceptual opacity. Particles, fields, breathing — chosen to match the class's metaphor.
5. **Voice** — Abë is wired through `/api/<artifact>` (proxy modeled on `/api/chat.js`), with the substrate baked into the system prompt so she speaks from inside the page.
6. **Send** — The Artifact is sent to its named recipient first, with a personal note. Public discovery comes second.

This is the contract. Every Artifact passes all six gates or it is not an Artifact — it is a marketing page wearing different clothes.

---

## V. Inference (named)

**Assumption:** Sophia receiving `bravetto.com/junction` will read it as a contribution to her framework, not a competitive move. This is a hypothesis Angie should test before sending. Recommended posture in the send: *"I drew your organism. I named a class extension I think is missing. Here it is. Tear it apart."*

**Assumption:** the canonical voice convention — Cormorant + Instrument Sans, gold + cream + terra — is the Artifact-class language, distinct from the Inter-based product pages (`/products`, `/why-bravetto`). The site has both languages in production; the Artifact pages should consistently use the editorial language, the product pages the operational one.

---

## VI. The push that failed

**Truth class:** observed runtime artifact, not a bug.

The error — *"is at d2173368 but expected 7302290"* — is git's compare-and-swap rejecting the push because the remote's ref pointer is already at the new commit hash. The most likely cause: the previous push *did* succeed at the server, but the response was lost in transit, leaving the local client thinking the push failed. The commit is probably already on remote.

**Verify, then either confirm or recover:**

```bash
cd ~/repos/products/bravetto
git fetch origin
git log origin/fix/sales-lead-canonical-witness-2026-05-06 -1 --oneline
```

If that returns `d217336 feat(junction):...` — **the push already succeeded**. Vercel's preview build is in motion or done. Skip to §VII.

If it returns a different hash, run:

```bash
git pull --rebase origin fix/sales-lead-canonical-witness-2026-05-06
git push
```

That handles the diverged case cleanly.

---

## VII. The branch problem (the actual blocker)

The commit landed on `fix/sales-lead-canonical-witness-2026-05-06`, not `main`. Vercel's production deployment for `bravetto.com` only updates from the production branch (almost certainly `main`). What this branch produces is a **preview deployment** at a URL like `bravetto-<branch-hash>-bravetto.vercel.app/junction`.

For Angie to send `bravetto.com/junction` to Sophia, the commit needs to be on `main`. Three paths:

**Path A — Merge via GitHub PR (recommended).** Open a PR from `fix/sales-lead-canonical-witness-2026-05-06` to `main`. Review locally, merge. Vercel auto-deploys. Estimated time: 3 minutes.

**Path B — Cherry-pick to main.**
```bash
git checkout main
git pull
git cherry-pick d217336
git push
```
Cleaner history if the parent branch is unrelated to junction. Estimated time: 90 seconds.

**Path C — Send the preview URL.** Vercel's preview URL is real and shareable. If Mike wants to send the Artifact to Sophia *before* the parent branch is ready to merge, the preview URL is a valid send. The drawback: the URL is ugly (`bravetto-<hash>-bravetto.vercel.app/junction`) and changes when the branch is updated.

Recommendation: **Path B**. Cherry-pick the junction commit onto main, push, send the clean URL.

---

## VIII. Smallest useful next move

```bash
cd ~/repos/products/bravetto
git fetch origin
git checkout main
git pull
git cherry-pick d217336
git push
```

When that lands, `bravetto.com/junction` will be live in 60–90 seconds. Test once. Then Angie sends.

---

## IX. After the send

Update `sitemap.xml` to include `/junction`. Add an `Artifacts` section to whatever internal index exists (or create one). When the next Artifact is produced — for Angie, for Button, for Mayo — the same six-gate process holds.

The site already has a thesis. The Artifact pattern names a missing category and gives it a home.

⊗ *Bravetto · AbëONE · LOVE = LIFE = ONE*
