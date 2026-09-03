# 0002. Adopt MUI for Styling

* **Status:** Accepted
* **Date:** 2026-09-02
* **Deciders:** Product Lead, Design Engineer

## Context

BUILD_SPEC.md originally locked styling to CSS custom properties plus a small component stylesheet, to avoid spending deadline time on a design-system dependency. `@mui/material`, `@emotion/react`, and `@emotion/styled` have since been added to `package.json` to accelerate accessible, responsive component construction (forms, dialogs, focus management) ahead of the P1/P2 build phases.

## Decision

1. Use MUI (`@mui/material` with the Emotion styling engine) as the component and theming layer.
2. Express the Section 7 design tokens (colors, radius, spacing, typography scale, contrast targets) as a custom MUI theme (`src/styles/theme.ts`) rather than a standalone `tokens.css` file. `ThemeProvider` and `CssBaseline` wrap the app root.
3. All Section 7 requirements (contrast, target size, tone, motion, responsive breakpoints, accessibility) remain mandatory; MUI is the implementation mechanism, not a scope change.
4. This does not relax the no-backend, no-auth, no-external-network constraints from ADR 0001.

## Consequences

* **Positive:** Faster accessible form/dialog/focus-trap implementation for the plan-review and reset flows; consistent theming primitives.
* **Negative:** Larger bundle size than hand-written CSS; production build must be checked against Section 9 performance targets after MUI is wired into the app shell.

## Rollback

If bundle size or deadline pressure makes MUI impractical, remove `@mui/material`, `@emotion/react`, and `@emotion/styled` from `package.json`, delete `src/styles/theme.ts`, and restore a `src/styles/tokens.css` custom-properties file satisfying the same Section 7 token values. No domain, command, or WebMCP code should depend on MUI directly (keep MUI usage confined to `src/components/` and `src/app/`).
