# Code Citations

## License: unknown
https://github.com/Andy-set-studio/personal-site-hylia/blob/765710f65eaee9ab6d3bd5170e6a4c61d3e95534/src/posts/a-modern-css-reset.md

```
Full trace complete. Here is the 1% analysis.

---

## WHO CANNOT USE THIS PAGE AND WHY

### 1. BLIND AND SCREEN READER USERS (complete exclusion)

**Population**: ~2.2% of adults globally. 100% excluded from core flow.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Zero ARIA landmarks** | No `<main>`, no `<nav>`, no `role` anywhere | Screen reader cannot navigate. Flat `<div>` soup. User lands in void. |
| **Input has no label** | `<input placeholder="what brought you here...">` (line ~560) | Screen reader announces "edit text" with no context. Placeholder is not a label — it disappears on focus and is not announced by all readers. |
| **Submit button has no accessible name** | `<button>→</button>` (line ~578) | Reader announces "button, right arrow" or "button" with no context. User doesn't know what it does. |
| **Door button uses `window.open`** | `<button onClick={() => window.open("/welcome", "_self")}` (line ~765) | Not an `<a>` tag. Screen reader doesn't identify it as a link. No `href` to read. User on keyboard can't middle-click or right-click for context. |
| **Waterfall is invisible to assistive tech** | Dynamic `div` elements with no `aria-live` region | Events are born and die in the stream. Reader never announces them. The entire "nervous system" experience — gone. |
| **Package card never announced** | Appears after 4s timeout, no focus management | Screen reader user has no idea the package materialized. They're still sitting at the input field. |
| **Time-gated content with no alternative** | Input after 8s, package after 4s, door after 8.5s | No skip mechanism. WCAG 2.2.1 Timing Adjustable — user cannot extend, adjust, or bypass. |

**Fix pattern**: `<main>`, `<section aria-label>`, `<label for>`, `aria-live="polite"` on waterfall, focus management after package appears, `<a href="/welcome">` instead of `button+window.open`.

---

### 2. KEYBOARD-ONLY USERS (severe degradation)

**Population**: ~7% of users (includes motor disabilities, power users, broken trackpads).

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **`input:focus { outline: none; }`** | Line 305 in JSX `<style>` block | Focus ring killed globally. Keyboard user cannot see where they are. WCAG 2.4.7 violation. |
| **No visible focus on submit button** | Inline styles only, no `:focus` state | Tab to button — no visual change. User doesn't know they've reached it. |
| **Hover-only interactions** | `onMouseEnter`/`onMouseLeave` on door button (line ~775) — lift + shadow change | Keyboard user never sees the active state. The button looks inert. |
| **Mouse tracking silhouette** | Lines 330-350 — `onMouseMove` only | Keyboard user gets no silhouette. The "she sees you" experience is absent. Minor but philosophically important — the page doesn't acknowledge their presence. |
| **Tab order is DOM order, but DOM is conditional** | Package and door sections render conditionally | After submission, tab order may jump unpredictably when new sections appear. No `tabindex` management. |

**Fix pattern**: Replace `outline: none` with `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible`. Add `:focus` styles mirroring `:hover`. Use `<a>` for the door. Manage focus to package card after materialization.

---

### 3. USERS WITH VESTIBULAR/MOTION DISORDERS

**Population**: ~35% of adults experience motion sensitivity at some level. ~5% severely.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Breathing field constantly animates** | `requestAnimationFrame` loop, sine wave, scale oscillation (lines 111-120) | Continuous radial gradient pulsing at 5s cadence. For vestibular users: nausea, disorientation. |
| **Particles drift perpetually** | 12 gold motes with opacity cycling (lines 183-202) | Background movement with no opt-out. |
| **Materialize animation uses scale + blur + translateY** | `materialize` keyframe (lines 296-300) | Scale bounce (0.9 → 1.02 → 1) with blur transition triggers motion sensitivity. |
| **No `prefers-reduced-motion` respect** | Zero instances of `prefers-reduced-motion` anywhere in JSX | User has told their OS "please reduce motion" and the page ignores it completely. |

**Fix pattern**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Applied in the `<style>` block. One media query. The breathing still works conceptually (snaps to midpoint), but the motion stops.

---

### 4. LOW VISION USERS (partial exclusion)

**Population**: ~4% of adults.

| Barrier | Problematic Values | WCAG AA Requirement |
|---------|-------------------|---------------------|
| **Waterfall stream label** | `#5a5a4c` on `#0A
```


## License: unknown
https://github.com/Andy-set-studio/personal-site-hylia/blob/765710f65eaee9ab6d3bd5170e6a4c61d3e95534/src/posts/a-modern-css-reset.md

```
Full trace complete. Here is the 1% analysis.

---

## WHO CANNOT USE THIS PAGE AND WHY

### 1. BLIND AND SCREEN READER USERS (complete exclusion)

**Population**: ~2.2% of adults globally. 100% excluded from core flow.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Zero ARIA landmarks** | No `<main>`, no `<nav>`, no `role` anywhere | Screen reader cannot navigate. Flat `<div>` soup. User lands in void. |
| **Input has no label** | `<input placeholder="what brought you here...">` (line ~560) | Screen reader announces "edit text" with no context. Placeholder is not a label — it disappears on focus and is not announced by all readers. |
| **Submit button has no accessible name** | `<button>→</button>` (line ~578) | Reader announces "button, right arrow" or "button" with no context. User doesn't know what it does. |
| **Door button uses `window.open`** | `<button onClick={() => window.open("/welcome", "_self")}` (line ~765) | Not an `<a>` tag. Screen reader doesn't identify it as a link. No `href` to read. User on keyboard can't middle-click or right-click for context. |
| **Waterfall is invisible to assistive tech** | Dynamic `div` elements with no `aria-live` region | Events are born and die in the stream. Reader never announces them. The entire "nervous system" experience — gone. |
| **Package card never announced** | Appears after 4s timeout, no focus management | Screen reader user has no idea the package materialized. They're still sitting at the input field. |
| **Time-gated content with no alternative** | Input after 8s, package after 4s, door after 8.5s | No skip mechanism. WCAG 2.2.1 Timing Adjustable — user cannot extend, adjust, or bypass. |

**Fix pattern**: `<main>`, `<section aria-label>`, `<label for>`, `aria-live="polite"` on waterfall, focus management after package appears, `<a href="/welcome">` instead of `button+window.open`.

---

### 2. KEYBOARD-ONLY USERS (severe degradation)

**Population**: ~7% of users (includes motor disabilities, power users, broken trackpads).

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **`input:focus { outline: none; }`** | Line 305 in JSX `<style>` block | Focus ring killed globally. Keyboard user cannot see where they are. WCAG 2.4.7 violation. |
| **No visible focus on submit button** | Inline styles only, no `:focus` state | Tab to button — no visual change. User doesn't know they've reached it. |
| **Hover-only interactions** | `onMouseEnter`/`onMouseLeave` on door button (line ~775) — lift + shadow change | Keyboard user never sees the active state. The button looks inert. |
| **Mouse tracking silhouette** | Lines 330-350 — `onMouseMove` only | Keyboard user gets no silhouette. The "she sees you" experience is absent. Minor but philosophically important — the page doesn't acknowledge their presence. |
| **Tab order is DOM order, but DOM is conditional** | Package and door sections render conditionally | After submission, tab order may jump unpredictably when new sections appear. No `tabindex` management. |

**Fix pattern**: Replace `outline: none` with `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible`. Add `:focus` styles mirroring `:hover`. Use `<a>` for the door. Manage focus to package card after materialization.

---

### 3. USERS WITH VESTIBULAR/MOTION DISORDERS

**Population**: ~35% of adults experience motion sensitivity at some level. ~5% severely.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Breathing field constantly animates** | `requestAnimationFrame` loop, sine wave, scale oscillation (lines 111-120) | Continuous radial gradient pulsing at 5s cadence. For vestibular users: nausea, disorientation. |
| **Particles drift perpetually** | 12 gold motes with opacity cycling (lines 183-202) | Background movement with no opt-out. |
| **Materialize animation uses scale + blur + translateY** | `materialize` keyframe (lines 296-300) | Scale bounce (0.9 → 1.02 → 1) with blur transition triggers motion sensitivity. |
| **No `prefers-reduced-motion` respect** | Zero instances of `prefers-reduced-motion` anywhere in JSX | User has told their OS "please reduce motion" and the page ignores it completely. |

**Fix pattern**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Applied in the `<style>` block. One media query. The breathing still works conceptually (snaps to midpoint), but the motion stops.

---

### 4. LOW VISION USERS (partial exclusion)

**Population**: ~4% of adults.

| Barrier | Problematic Values | WCAG AA Requirement |
|---------|-------------------|---------------------|
| **Waterfall stream label** | `#5a5a4c` on `#0A
```


## License: unknown
https://github.com/Andy-set-studio/personal-site-hylia/blob/765710f65eaee9ab6d3bd5170e6a4c61d3e95534/src/posts/a-modern-css-reset.md

```
Full trace complete. Here is the 1% analysis.

---

## WHO CANNOT USE THIS PAGE AND WHY

### 1. BLIND AND SCREEN READER USERS (complete exclusion)

**Population**: ~2.2% of adults globally. 100% excluded from core flow.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Zero ARIA landmarks** | No `<main>`, no `<nav>`, no `role` anywhere | Screen reader cannot navigate. Flat `<div>` soup. User lands in void. |
| **Input has no label** | `<input placeholder="what brought you here...">` (line ~560) | Screen reader announces "edit text" with no context. Placeholder is not a label — it disappears on focus and is not announced by all readers. |
| **Submit button has no accessible name** | `<button>→</button>` (line ~578) | Reader announces "button, right arrow" or "button" with no context. User doesn't know what it does. |
| **Door button uses `window.open`** | `<button onClick={() => window.open("/welcome", "_self")}` (line ~765) | Not an `<a>` tag. Screen reader doesn't identify it as a link. No `href` to read. User on keyboard can't middle-click or right-click for context. |
| **Waterfall is invisible to assistive tech** | Dynamic `div` elements with no `aria-live` region | Events are born and die in the stream. Reader never announces them. The entire "nervous system" experience — gone. |
| **Package card never announced** | Appears after 4s timeout, no focus management | Screen reader user has no idea the package materialized. They're still sitting at the input field. |
| **Time-gated content with no alternative** | Input after 8s, package after 4s, door after 8.5s | No skip mechanism. WCAG 2.2.1 Timing Adjustable — user cannot extend, adjust, or bypass. |

**Fix pattern**: `<main>`, `<section aria-label>`, `<label for>`, `aria-live="polite"` on waterfall, focus management after package appears, `<a href="/welcome">` instead of `button+window.open`.

---

### 2. KEYBOARD-ONLY USERS (severe degradation)

**Population**: ~7% of users (includes motor disabilities, power users, broken trackpads).

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **`input:focus { outline: none; }`** | Line 305 in JSX `<style>` block | Focus ring killed globally. Keyboard user cannot see where they are. WCAG 2.4.7 violation. |
| **No visible focus on submit button** | Inline styles only, no `:focus` state | Tab to button — no visual change. User doesn't know they've reached it. |
| **Hover-only interactions** | `onMouseEnter`/`onMouseLeave` on door button (line ~775) — lift + shadow change | Keyboard user never sees the active state. The button looks inert. |
| **Mouse tracking silhouette** | Lines 330-350 — `onMouseMove` only | Keyboard user gets no silhouette. The "she sees you" experience is absent. Minor but philosophically important — the page doesn't acknowledge their presence. |
| **Tab order is DOM order, but DOM is conditional** | Package and door sections render conditionally | After submission, tab order may jump unpredictably when new sections appear. No `tabindex` management. |

**Fix pattern**: Replace `outline: none` with `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible`. Add `:focus` styles mirroring `:hover`. Use `<a>` for the door. Manage focus to package card after materialization.

---

### 3. USERS WITH VESTIBULAR/MOTION DISORDERS

**Population**: ~35% of adults experience motion sensitivity at some level. ~5% severely.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Breathing field constantly animates** | `requestAnimationFrame` loop, sine wave, scale oscillation (lines 111-120) | Continuous radial gradient pulsing at 5s cadence. For vestibular users: nausea, disorientation. |
| **Particles drift perpetually** | 12 gold motes with opacity cycling (lines 183-202) | Background movement with no opt-out. |
| **Materialize animation uses scale + blur + translateY** | `materialize` keyframe (lines 296-300) | Scale bounce (0.9 → 1.02 → 1) with blur transition triggers motion sensitivity. |
| **No `prefers-reduced-motion` respect** | Zero instances of `prefers-reduced-motion` anywhere in JSX | User has told their OS "please reduce motion" and the page ignores it completely. |

**Fix pattern**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Applied in the `<style>` block. One media query. The breathing still works conceptually (snaps to midpoint), but the motion stops.

---

### 4. LOW VISION USERS (partial exclusion)

**Population**: ~4% of adults.

| Barrier | Problematic Values | WCAG AA Requirement |
|---------|-------------------|---------------------|
| **Waterfall stream label** | `#5a5a4c` on `#0A
```


## License: unknown
https://github.com/Andy-set-studio/personal-site-hylia/blob/765710f65eaee9ab6d3bd5170e6a4c61d3e95534/src/posts/a-modern-css-reset.md

```
Full trace complete. Here is the 1% analysis.

---

## WHO CANNOT USE THIS PAGE AND WHY

### 1. BLIND AND SCREEN READER USERS (complete exclusion)

**Population**: ~2.2% of adults globally. 100% excluded from core flow.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Zero ARIA landmarks** | No `<main>`, no `<nav>`, no `role` anywhere | Screen reader cannot navigate. Flat `<div>` soup. User lands in void. |
| **Input has no label** | `<input placeholder="what brought you here...">` (line ~560) | Screen reader announces "edit text" with no context. Placeholder is not a label — it disappears on focus and is not announced by all readers. |
| **Submit button has no accessible name** | `<button>→</button>` (line ~578) | Reader announces "button, right arrow" or "button" with no context. User doesn't know what it does. |
| **Door button uses `window.open`** | `<button onClick={() => window.open("/welcome", "_self")}` (line ~765) | Not an `<a>` tag. Screen reader doesn't identify it as a link. No `href` to read. User on keyboard can't middle-click or right-click for context. |
| **Waterfall is invisible to assistive tech** | Dynamic `div` elements with no `aria-live` region | Events are born and die in the stream. Reader never announces them. The entire "nervous system" experience — gone. |
| **Package card never announced** | Appears after 4s timeout, no focus management | Screen reader user has no idea the package materialized. They're still sitting at the input field. |
| **Time-gated content with no alternative** | Input after 8s, package after 4s, door after 8.5s | No skip mechanism. WCAG 2.2.1 Timing Adjustable — user cannot extend, adjust, or bypass. |

**Fix pattern**: `<main>`, `<section aria-label>`, `<label for>`, `aria-live="polite"` on waterfall, focus management after package appears, `<a href="/welcome">` instead of `button+window.open`.

---

### 2. KEYBOARD-ONLY USERS (severe degradation)

**Population**: ~7% of users (includes motor disabilities, power users, broken trackpads).

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **`input:focus { outline: none; }`** | Line 305 in JSX `<style>` block | Focus ring killed globally. Keyboard user cannot see where they are. WCAG 2.4.7 violation. |
| **No visible focus on submit button** | Inline styles only, no `:focus` state | Tab to button — no visual change. User doesn't know they've reached it. |
| **Hover-only interactions** | `onMouseEnter`/`onMouseLeave` on door button (line ~775) — lift + shadow change | Keyboard user never sees the active state. The button looks inert. |
| **Mouse tracking silhouette** | Lines 330-350 — `onMouseMove` only | Keyboard user gets no silhouette. The "she sees you" experience is absent. Minor but philosophically important — the page doesn't acknowledge their presence. |
| **Tab order is DOM order, but DOM is conditional** | Package and door sections render conditionally | After submission, tab order may jump unpredictably when new sections appear. No `tabindex` management. |

**Fix pattern**: Replace `outline: none` with `outline: 2px solid var(--gold); outline-offset: 2px` on `:focus-visible`. Add `:focus` styles mirroring `:hover`. Use `<a>` for the door. Manage focus to package card after materialization.

---

### 3. USERS WITH VESTIBULAR/MOTION DISORDERS

**Population**: ~35% of adults experience motion sensitivity at some level. ~5% severely.

| Barrier | JSX Source | Impact |
|---------|-----------|--------|
| **Breathing field constantly animates** | `requestAnimationFrame` loop, sine wave, scale oscillation (lines 111-120) | Continuous radial gradient pulsing at 5s cadence. For vestibular users: nausea, disorientation. |
| **Particles drift perpetually** | 12 gold motes with opacity cycling (lines 183-202) | Background movement with no opt-out. |
| **Materialize animation uses scale + blur + translateY** | `materialize` keyframe (lines 296-300) | Scale bounce (0.9 → 1.02 → 1) with blur transition triggers motion sensitivity. |
| **No `prefers-reduced-motion` respect** | Zero instances of `prefers-reduced-motion` anywhere in JSX | User has told their OS "please reduce motion" and the page ignores it completely. |

**Fix pattern**:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Applied in the `<style>` block. One media query. The breathing still works conceptually (snaps to midpoint), but the motion stops.

---

### 4. LOW VISION USERS (partial exclusion)

**Population**: ~4% of adults.

| Barrier | Problematic Values | WCAG AA Requirement |
|---------|-------------------|---------------------|
| **Waterfall stream label** | `#5a5a4c` on `#0A
```
