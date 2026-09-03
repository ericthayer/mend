---
description: "Use when building or refactoring React UI with Material UI v9 in this repo. Enforces MUI v9 imports, theming, styling hierarchy, dark-mode/CSS-vars usage, migration-safe slot APIs, and TypeScript patterns."
name: "MUI v9 Implementation Rules"
applyTo: "src/**/*.{ts,tsx}"
---

# MUI v9 implementation rules

Use these rules for all `@mui/material` work.

## Source references (required)

- Primary index: https://mui.com/material-ui/llms.txt

## 1) Imports and packages

- Keep MUI packages on v9-compatible majors (`@mui/material`, `@mui/system`, `@mui/icons-material`, `@mui/utils`, `@mui/styled-engine*`).
- Use path imports for components and icons:
  - ✅ `import Button from '@mui/material/Button'`
  - ✅ `import DeleteIcon from '@mui/icons-material/Delete'`
  - ❌ `import { Button } from '@mui/material'`
  - ❌ `import { Delete } from '@mui/icons-material'`
- Do not suggest CDN usage for production code.

## 2) Theming-first architecture

- Prefer one app-level `ThemeProvider` near the React root.
- Use `createTheme` and theme tokens (`palette`, `typography`, `spacing`, `breakpoints`, `components`) before ad-hoc inline styles.
- Add `CssBaseline` for consistent browser defaults unless there is an explicit reason not to.
- Keep heavy cross-app visual changes in theme configuration; prefer local component styles only when scope is intentionally narrow.

## 3) Styling decision ladder (narrow → broad)

- One instance: use `sx`.
- Reusable styled primitive: use `styled()`.
- App-wide component defaults/overrides: use `theme.components` (`defaultProps`, `styleOverrides`, `variants`).
- Global HTML-level CSS: use `GlobalStyles`/`MuiCssBaseline` overrides.
- Never style unstable generated class hashes; target stable `.Mui*` global classes and slot selectors.

## 4) v9 API conventions (required)

- Use `slots` and `slotProps` (not deprecated `components`, `componentsProps`, `*Component`, `*Props` legacy patterns).
- Use `sx` instead of deprecated system props on components (`mt`, `mr`, `bgcolor`, etc.).
- For component variants in theme overrides, place variants in slot overrides (typically `styleOverrides.root.variants`).

## 5) Dark mode and CSS variables

- Prefer the v9 color-scheme model with CSS variables when mode switching is needed:
  - `createTheme({ colorSchemes: { dark: true }, cssVariables: true })`
- For mode-specific styles, use `theme.applyStyles('dark', ...)`.
- Avoid `theme.palette.mode === 'dark'` branching in style objects where flicker/hydration issues can occur.
- When using `theme.vars` in TypeScript, include:
  - `import type {} from '@mui/material/themeCssVarsAugmentation';`

## 6) TypeScript expectations

- Keep strict typing enabled.
- Use module augmentation when adding custom theme tokens, palette extensions, or component variant overrides.
- For `sx` objects shared across variables, use `as const` (or inline object literals) to avoid type widening issues.

## 7) Accessibility and semantic safeguards

- Preserve semantic structure from MUI v9 updates (keyboard/focus behavior in Tabs/Menu/Stepper, etc.).
- If replacing button-like internals via `component`, ensure correct semantics and set `nativeButton` when required by v9 behavior.
- Use `Stack` for vertical flow; avoid `Grid direction="column"` patterns.

## 8) Migration and maintenance

- When touching older code, proactively migrate deprecated APIs instead of adding new legacy usage.
- Prefer official codemods for broad migrations (`deprecations/all`, `v9 system-props`, targeted deprecation codemods) before manual edits.

## 9) Repo-specific constraints

- Follow workspace guardrails in `.github/copilot-instructions.md` and `docs/BUILD_SPEC.md`.
- Do not introduce remote side effects, backend services, or architecture changes outside project constraints while implementing MUI UI work.
