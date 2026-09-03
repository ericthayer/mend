---
score: 22
max: 40
naHeuristics: 
mode: operate
method: dual-agent
timestamp: 2026-09-03T09-08-02Z
slug: src-app-appshell-tsx
---
# Critique — Mend app shell (src/app/AppShell.tsx)

Method: dual-agent (A: design review · B: detector + browser). Mode: Operate. Score 22/40 (all 10 heuristics applicable).

## Design specificity
Competently themed MUI admin scaffold, not an authored recovery planner. Only the amber review surface and section headings carry product signal.

## Priority issues
- [P0] Approval unmounts PlanReview, killing its live region; focus drops to body; no visible confirmation.
- [P0] BUILD_SPEC §7 two-column layout at ≥900px not implemented; sections capped at 860px inside 1152px main; ~290px dead column, misaligned right edges.
- [P1] Section ordering buries the primary task (empty NextActions above PlanReview).
- [P1] Red spent on "Delete local case" (only header action, full-width on mobile); safety banner shares amber with review state.
- [P2] Chips stretch full-width in column Stacks (Agent tools chip = 1152px at 1280).
- [P2] Raw enums/machine provenance in copy (Priority: now, Actor: agent, Source: webmcp, absolute timestamps).

## Detector
detect.mjs ran DEGRADED (regex fallback, parser deps missing): 0 CLI findings (undercount). Browser overlay: 9 findings — cramped-padding ×6 (small chips), overused-font ×1, cream-palette ×1, dark-glow ×1 (false positive: light bg), text-occlusion ×2 (false positive: collapsed details). Measurements: no horizontal overflow at 1280/390; 1 target <44px (details summary, 29px); 0 text <14px; 1 h1, sequential headings.

## Minor
- Only 4px separates h2/h3/body heading scale.
- Paper has border + shadow (double edge).
- Unstyled details/summary in WebMCPStatus.
- Draft body at 14px secondary color hard to review.
- Header burns 76–159px chrome before content.
