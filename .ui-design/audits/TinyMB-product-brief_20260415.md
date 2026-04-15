# Accessibility Audit Report

**Audit ID:** TinyMB-product-brief_20260415
**Date:** 2026-04-15
**Target:** `TinyMB/TinyMB-product-brief.html`
**WCAG Level:** AA (WCAG 2.1)

---

## Executive Summary

**Compliance Status:** Fixed — Passing (post-remediation)

| Severity | Found | Fixed |
|----------|-------|-------|
| Serious  | 3     | 3 ✓   |
| Moderate | 3     | 3 ✓   |
| Minor    | 1     | 1 ✓   |

All issues have been remediated directly in the source file.

---

## Issues Found & Fixed

### 1. Color Contrast Failures (WCAG 1.4.3 — Level AA) · **Serious**

**Problem:** Two CSS variables failed the 4.5:1 contrast ratio requirement for normal text:
- `--text-faint: #55596a` on `#0c0d10` → **2.94:1** (used in nav labels, sidebar meta, eyebrow)
- `--gold-dim: #8a6d35` on `#0c0d10` → **3.67:1** (used in section numbers, design-block tags)

**Fix:**
```css
/* Before */
--text-faint: #55596a;
--gold-dim:   #8a6d35;

/* After */
--text-faint: #818898;  /* 5.39:1 on main bg, 4.91:1 on card bg */
--gold-dim:   #a87e40;  /* 5.28:1 on main bg */
```

---

### 2. Missing Skip Navigation Link (WCAG 2.4.1 — Level A) · **Serious**

**Problem:** No skip link to bypass the sidebar navigation. Keyboard users must tab through all nav items to reach main content on every page load.

**Fix:** Added a visually hidden skip link that becomes visible on focus:
```html
<a class="skip-link" href="#main-content">跳转到主要内容</a>
```
```css
.skip-link { position: absolute; top: -100%; ... }
.skip-link:focus { top: 0; }
```

---

### 3. P2 Table Built With Divs — No Table Semantics (WCAG 1.3.1 — Level A) · **Serious**

**Problem:** The P2 relationship table used CSS grid divs. Screen readers could not understand column/row relationships.

**Fix:** Converted to a proper `<table>` with `<thead>`, `<th scope="col">`, `<th scope="row">`, `<td>`.

---

### 4. Missing Heading Hierarchy — Subsection Titles Were Divs (WCAG 1.3.1, 2.4.6 — Level A/AA) · **Moderate**

**Problem:** Three subsection titles (定位, 产品形态, 预期的游戏体验) were `<div>` elements. Screen reader users navigating by headings would see only h1 + h2 with no sub-structure.

**Fix:** Changed all `.subsection-title` divs to `<h3>` — maintaining the same CSS class and visual appearance.

---

### 5. Table Row Headers Missing `scope` (WCAG 1.3.1 — Level A) · **Moderate**

**Problem:** First-column cells in comparison tables (`.plus-table`, `.cmp-table`, `.exp-table`) used `<td>` instead of `<th scope="row">`. Screen readers could not associate row labels with their data.

**Fix:** All first-column header cells converted to `<th scope="row">`. All column headers given `<th scope="col">`. The exp-table also gained a visually hidden `<thead>` for complete structure.

---

### 6. Decorative Symbols Not Hidden from Screen Readers (WCAG 1.1.1 — Level A) · **Moderate**

**Problem:** Symbols `✕`, `▲`, `✦`, `◆`, `→` were read aloud by screen readers as "cross mark", "up-pointing triangle", etc., creating noise without semantic value.

**Fix:** Added `aria-hidden="true"` to all decorative icon elements.

---

### 7. No Explicit Focus Indicator (WCAG 2.4.7 — Level AA) · **Minor**

**Problem:** No custom `:focus-visible` styles defined. Relied on browser defaults which vary significantly across browsers and may be invisible on dark backgrounds.

**Fix:**
```css
:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 3px;
  border-radius: 2px;
}
```

---

### 8. Nav Landmark Unlabeled (WCAG 4.1.2 — Level A) · **Minor** (bonus fix)

**Problem:** The `<nav>` element had no `aria-label`, making it indistinguishable from other nav landmarks if added in future.

**Fix:** `<nav aria-label="文档导航">`

---

## Passed Criteria (pre-existing)

| Criterion | Name | Level |
|-----------|------|-------|
| 1.3.1 | `<html lang="zh-CN">` present | A |
| 2.4.2 | Page has descriptive `<title>` | A |
| 1.3.4 | No orientation lock | AA |
| 1.4.4 | Text resizable (rem/em not used but zoom works) | AA |
| 2.1.1 | All nav links keyboard accessible | A |
| 3.1.1 | Language of page declared | A |
| 4.1.1 | No duplicate IDs | A |
| 1.4.3 | `--text` (#d8dae2) and `--text-dim` (#8a8e9a) contrast | AA |
| 1.4.3 | `--gold` (#c9a050) contrast — 7.89:1 | AA |
| 1.4.3 | `--teal` (#5b9ea8) contrast — 6.33:1 | AA |
| 2.4.1 | Skip link added | A |
| 1.3.1 | `<nav>`, `<main>`, `<section>` landmarks present | A |
| 1.3.1 | Heading hierarchy: h1 > h2 > h3 (post-fix) | A |

---

_WCAG Reference: https://www.w3.org/WAI/WCAG21/quickref/_
