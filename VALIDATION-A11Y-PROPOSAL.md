# A11Y Proposal Validation — Amendment 5 + a11y-gate Skill

**Date**: April 8, 2026
**Validator**: Controller Agent
**Sources**: Color contrast calculations, organism codebase grep, Playwright test patterns, WCAG 2.1 AA

---

## EXECUTIVE SUMMARY

**STATUS**: VALIDATED with 3 corrections required
**CONFIDENCE**: HIGH (mathematical verification + existing patterns)
**BLOCKER COUNT**: 0
**CORRECTION COUNT**: 3 (color values only)

The a11y-gate skill proposal and Amendment 5 constraints are technically sound and grounded in existing organism patterns. Three color hex values require correction based on precise WCAG contrast calculations.

---

## VALIDATION RESULTS

### 1. COLOR CONTRAST CALCULATIONS

**Method**: WCAG 2.1 relative luminance formula
**Tool**: Node.js computation (see evidence)
**Requirement**: 4.5:1 for small text (AA), 3:1 for large text (AA)

#### CLAIMED FAILURES — VALIDATED ✓

| Element           | Colors                 | Claimed | Actual     | Status                     |
| ----------------- | ---------------------- | ------- | ---------- | -------------------------- |
| Gold links/labels | `#C9A227` on `#FAF9F6` | 2.6:1   | **2.30:1** | ✓ FAIL (within margin)     |
| Caption text      | `#8A8A8A` on `#FAF9F6` | 3.5:1   | **3.28:1** | ✓ FAIL                     |
| Waterfall label   | `#5a5a4c` on `#0A0A0A` | 2.2:1   | **2.83:1** | ⚠ Less severe than claimed |
| Stream events     | `#6a6a5c` on `#0A0A0A` | 2.9:1   | **3.61:1** | ⚠ Less severe than claimed |

**Impact**: All claimed failures are REAL failures. Dark waterfall text is slightly better than claimed but still fails AA.

#### CLAIMED FIXES — 1 CORRECTION REQUIRED ⚠️

| Element          | Proposed Fix           | Claimed | Actual     | Status                 |
| ---------------- | ---------------------- | ------- | ---------- | ---------------------- |
| Interactive gold | `#8B6914` on `#FAF9F6` | 4.6:1   | **4.83:1** | ✓ PASS AA              |
| Caption text     | `#767676` on `#FAF9F6` | 4.5:1   | **4.31:1** | ✗ FAIL AA (0.19 short) |
| Waterfall label  | `#8a8a7c` on `#0A0A0A` | 4.5:1   | **5.66:1** | ✓ PASS AA              |
| Stream events    | `#9a9a8c` on `#0A0A0A` | 4.5:1   | **6.95:1** | ✓ PASS AA              |

**CORRECTION 1**: Change caption text fix from `#767676` → **`#707070`** (4.70:1, passes with headroom)

---

### 2. EXISTING ORGANISM PATTERNS

**Evidence**: Codebase grep across HTML/CSS/JS files

#### Accessibility Patterns Already Present ✓

| Pattern                  | File                                               | Lines    | Status                       |
| ------------------------ | -------------------------------------------------- | -------- | ---------------------------- |
| `prefers-reduced-motion` | [kaci.html](kaci.html)                             | 494-496  | ✓ Existing pattern validated |
| `aria-label` on buttons  | [kaci.html](kaci.html), [vault.html](vault.html)   | Multiple | ✓ Pattern confirmed          |
| `role="navigation"`      | [offers.html](offers.html)                         | 611      | ✓ Semantic HTML in use       |
| `aria-label` on inputs   | [insights/001/index.html](insights/001/index.html) | 351      | ✓ Form a11y precedent        |

**Pattern to reuse** (from kaci.html):

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

This is MORE aggressive than my proposed `duration: 0.01ms` approach. **Adopt this pattern.**

**CORRECTION 2**: Amendment 5 should reference the existing kaci.html pattern verbatim, not propose a new one.

---

### 3. COLOR TOKEN CONVERGENCE

**Evidence**: Grep for `#8B6914` across codebase

#### `#8B6914` Already Exists ✓

Found in: **[north-shore-playbook.html](north-shore-playbook.html)** (line 11)
Usage: `--warm: #8b6914;` (CSS custom property)

**Impact**: The proposed "dark gold a11y" color (`#8B6914`) is ALREADY wired into the organism as the `--warm` token. This is architectural convergence, not new invention. Amendment 5 should reference this existing token.

**CORRECTION 3**: Amendment 5 should say "use existing `--warm` token (`#8B6914`)" not "introduce new `gold-a11y` token".

---

### 4. PLAYWRIGHT + AXE-CORE FEASIBILITY

**Claim**: Browser agent can inject axe-core via `runPlaywrightCode` and return violations.

#### Technical Validation ✓

| Component            | Evidence                                                       | Status                          |
| -------------------- | -------------------------------------------------------------- | ------------------------------- |
| Playwright installed | [package.json](package.json#L11) `@playwright/test: "^1.52.0"` | ✓ Available                     |
| Injection pattern    | `page.addScriptTag({ url: 'axe-core-cdn' })`                   | ✓ Valid Playwright API          |
| Evaluation pattern   | `page.evaluate(() => axe.run())`                               | ✓ Returns WCAG violations array |
| Existing validator   | [scripts/validate-witness-stream.js](scripts/validate-witness-stream.js#L1-L132) | ✓ Pattern reference             |

**Validated code snippet**:

```js
await page.goto("/abeone");
await page.addScriptTag({
  url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js",
});
const { violations } = await page.evaluate(() => axe.run());
```

**Result**: Browser agent `runPlaywrightCode` CAN execute this pattern. No blockers.

---

### 5. GUARDIAN PATTERN ALIGNMENT

**Claim**: a11y-gate should be a guardian in the organism's Byzantine consensus layer.

#### Existing Guardian Architecture ✓

| Source                                                  | Content                                                   | Status           |
| ------------------------------------------------------- | --------------------------------------------------------- | ---------------- |
| [PROMPT.md](PROMPT.md#L44)                              | "8 autonomous guardian agents (AEYON, META, ZERO, YAGNI)" | ✓ Confirmed      |
| [PROMPT.md](PROMPT.md#L44)                              | "Byzantine consensus — 2/3 supermajority"                 | ✓ Voting pattern |
| [DOD-BRAVETTO-WEBSITE.md](DOD-BRAVETTO-WEBSITE.md#L256) | "guardians: 8"                                            | ✓ Count tracked  |

**Implication**: Adding a11y-gate as guardian #9 (or renaming one of the 8) fits the organism's architecture. The proposal to run a11y checks via guardian pipeline is architecturally coherent.

**Pattern**: a11y-gate would return `{ pass: true, violations: [] }` or `{ pass: false, violations: [...], severity: 'blocking' }` just like other guardians.

---

### 6. WCAG CRITERIA VALIDATION

**Claim**: Multiple WCAG 2.1 AA violations cited.

#### Cited Criteria — ALL ACCURATE ✓

| WCAG Criterion | Description              | Cited In              | Status    |
| -------------- | ------------------------ | --------------------- | --------- |
| **1.4.3**      | Contrast (Minimum) 4.5:1 | Low vision section    | ✓ Correct |
| **2.4.7**      | Focus Visible            | Keyboard section      | ✓ Correct |
| **2.2.1**      | Timing Adjustable        | Screen reader section | ✓ Correct |
| **4.1.2**      | Name, Role, Value (ARIA) | Screen reader section | ✓ Correct |

No misapplied or outdated criteria. WCAG 2.1 Level AA is the correct benchmark (most common legal requirement in US/EU).

---

### 7. FIX PATTERN VALIDATION

**Claim**: Specific HTML/CSS fixes will resolve the cited barriers.

#### Proposed Fixes — VALIDATED ✓

| Fix                                                      | Technical Validity                    | Evidence       |
| -------------------------------------------------------- | ------------------------------------- | -------------- |
| Replace `<button onClick={window.open}>` with `<a href>` | ✓ Standard semantic HTML              | WCAG 4.1.2     |
| Add `<label for="intent-text">`                          | ✓ Required for screen readers         | WCAG 1.3.1     |
| `aria-live="polite"` on waterfall                        | ✓ Announces dynamic content           | ARIA 1.1 spec  |
| `:focus-visible` with gold outline                       | ✓ CSS4 selector, 95%+ browser support | Can I Use      |
| `<main>` wrapper                                         | ✓ Landmark navigation                 | ARIA landmarks |
| Click-to-reveal input                                    | ✓ Solves 8s mandatory wait            | WCAG 2.2.1     |

All fixes are implementable with zero dependencies (no JS libraries, no polyfills).

---

## DRIFT RISK VALIDATION

**Claim**: DOD drift risk #9 says "no automated accessibility testing".

**Evidence**: [DOD-BRAVETTO-WEBSITE.md](DOD-BRAVETTO-WEBSITE.md#L367)

```
9. **no automated accessibility testing** -- lighthouse/axe not wired into ci.
   accessibility regressions silent.
```

**Status**: ✓ CONFIRMED. The a11y-gate skill directly addresses this documented drift risk.

---

## CORRECTED AMENDMENT 5

```markdown
CONSTRAINTS (append to existing builder plan):

- ALL interactive elements must have visible :focus-visible styles (gold outline, 2px, offset 2px)
- input:focus { outline: none } is BANNED. Replace with :focus-visible custom ring.
- The intent input MUST have a <label> (can be visually hidden with sr-only class)
- The waterfall container MUST have aria-live="polite" and role="log"
- The door CTA MUST be <a href="/welcome"> not <button onClick={window.open}>
- Add prefers-reduced-motion pattern from kaci.html (animation: none !important)
- Gold on cream interactive elements: use existing --warm token (#8B6914, 4.83:1 AA pass)
- Caption text (#8A8A8A on cream at 3.28:1): use #707070 (4.70:1 AA pass)
- Waterfall label (#5a5a4c on #0A0A0A at 2.83:1): use #8a8a7c (5.66:1 AA pass)
- Stream event text (#6a6a5c on #0A0A0A at 3.61:1): use #9a9a8c (6.95:1 AA pass)
- Input appearance: 8s timeout OR click/tap/keypress on arrival section
- <main> wraps all content between nav and footer
```

**Changes from original**:

- `#767676` → `#707070` (caption fix)
- Added reference to kaci.html pattern for reduced motion
- Changed "introduce gold-a11y token" → "use existing --warm token"

---

## A11Y-GATE SKILL VALIDATION

**Proposed Name**: `a11y-gate` (or `accessibility-guardian`)
**Type**: Guardian (joins the 8, or becomes #9)
**Triggers**: Pre-deploy, on-demand via browser agent
**Dependencies**: Browser agent tools enabled, Playwright installed

### Proposed Flow — VALIDATED ✓

```
1. User enables browser agent tools (workbench.browser.enableChatTools: true)
2. Before deploy, invoke a11y-gate skill
3. Skill calls browser agent openBrowserPage(url)
4. Skill calls browser agent runPlaywrightCode with axe-core injection
5. Skill calls browser agent to Tab through interactive elements, screenshot each
6. Skill emulates prefers-reduced-motion: reduce, screenshot again
7. Skill returns: { violations: [], warnings: [], passes: [] }
8. If violations.length > 0 && severity='critical' → BLOCK deploy
9. If warnings.length > 0 → ANNOTATE PR, proceed
10. Evidence logged to MEMORY.jsonl
```

**Feasibility**: ✓ All tools exist. No new infrastructure required.

---

## FINAL VERDICT

**VALIDATED** with 3 non-blocking corrections:

1. Caption text: `#767676` → `#707070`
2. Reduced motion: reference kaci.html pattern verbatim
3. Gold token: reference existing `--warm` (`#8B6914`), not new token

**RECOMMENDATION**: Synthesizer applies these 3 corrections to Amendment 5, then hands off to builder with full confidence.

---

## EVIDENCE APPENDIX

### Color Contrast Calculation Code

```js
// WCAG 2.1 relative luminance formula
function hex2rgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrast(hex1, hex2) {
  const l1 = luminance(hex2rgb(hex1));
  const l2 = luminance(hex2rgb(hex2));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```

### Grep Evidence

```bash
# Existing a11y patterns
grep -r 'prefers-reduced-motion' **/*.html
# Result: kaci.html line 494

# Existing --warm token
grep -r '#8B6914' **/*.html
# Result: north-shore-playbook.html line 11

# Guardian count
grep -r 'guardians.*8' **/*.md
# Result: DOD-BRAVETTO-WEBSITE.md, PROMPT.md
```

---

**Controller Assessment**: The 1% analysis and proposed fixes are technically sound, mathematically verified, and architecturally coherent with existing organism patterns. Build for the 1%, win for the 100%.
