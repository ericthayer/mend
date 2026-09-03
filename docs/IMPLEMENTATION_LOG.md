# Implementation Log — Mend

## Master Task Status

| ID | Status | Phase | Description | Output Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| T0.1 | DONE | P0 | Initialize reproducible repository | Package configs, scripts, MIT license, app skeleton |
| T0.2 | DONE | P0 | Install agent execution harness (pre-created) | `AGENTS.md`, `docs/BUILD_SPEC.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/EVAL_RESULTS.md`, `docs/decisions/0001-local-first-contest-architecture.md` |
| T1.1 | DONE | P0 | Domain, schemas, commands, store | Domain logic, Zod schemas, Zustand store, fixtures |
| T1.2 | DONE | P0 | Responsive shell & base views | Tokens, header, safety banner, empty state |
| T1.3 | DONE | P0 | Plan review & next actions | Review card, manual review commands, priority lists |
| T1.4 | DONE | P1 | Supporting case views | Record list, draft view, activity timeline, reset modal |
| T2.1 | DONE | P0 | WebMCP platform adapter | Adapter, type augmentation, model-context mock |
| T2.2 | DONE | P0 | Imperative WebMCP tools | Snapshot, create case, add record, stage plan tools |
| T2.3 | READY | P0 | Declarative review form | Semantic `<form toolname="start_plan_review">` |
| T2.4 | BLOCKED | P1 | Safe outreach drafting tool | `stage_outreach_draft` tool & draft list wiring |
| T3.1 | BLOCKED | P0 | Unit & integration tests | Test coverage for domain invariants & authority gates |
| T3.2 | BLOCKED | P0 | Hardened accessibility & states | Keyboard traversal, axe a11y checks, live regions |
| T3.3 | BLOCKED | P1 | End-to-end browser journeys | Playwright happy-path test suite |
| T4.1 | BLOCKED | P0 | Production Netlify build | Headers, redirects, static build verification |
| T4.2 | BLOCKED | P0 | Real WebMCP client smoke tests | Chrome DevTools & in-app browser evals |
| T5.1 | BLOCKED | P0 | Judge-ready documentation | README, screenshots, reproduction steps |
| T5.2 | BLOCKED | P0 | Sub-three-minute demo video | Video recording and public link |
| T5.3 | BLOCKED | P0 | Submission & repository freeze | Devpost copy verification and branch freeze |

---

## Execution Entries

### Entry: T0.1 — Repository Initialization
* **Status:** DONE
* **Acceptance criteria (BUILD_SPEC.md §T0.1):**
  * `npm ci` succeeds from a clean checkout.
  * `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build` pass.
  * Repository contains a visible OSI-approved license file.
* **Context:** Partial scaffolding already existed and is committed (`package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `LICENSE`, `.gitignore`, `src/test/setup.ts`, `src/webmcp/webmcp.d.ts`). This entry completes the repository rather than reinitializing it. `@mui/material`, `@emotion/react`, `@emotion/styled` are retained per ADR 0002; no other design-system dependency was added.
* **Planned Files:**
  * `src/webmcp/webmcp.d.ts` (fix) — move `Document` augmentation inside `declare global` so it merges with the built-in DOM type instead of shadowing it (was failing `npm run lint`).
  * `index.html`, `src/main.tsx`, `src/App.tsx` (new) — minimal buildable app shell; full MUI theming deferred to T1.2.
  * `src/App.test.tsx` (new) — minimal render test so `test:run` exercises real coverage.
  * `.gitignore` (edit) — add `*.tsbuildinfo`, `coverage`, `playwright-report`, `test-results`.
  * `tsconfig.tsbuildinfo` — untracked from git (generated build artifact, should not be committed).
* **Validation Commands:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm ci` — 392 packages installed, exit 0. (`npm audit` reports 5 pre-existing transitive vulnerabilities in dev tooling; no direct action taken, out of scope for T0.1.)
  * `npm run lint` — `eslint .` exit 0, no errors or warnings (previously failing on `src/webmcp/webmcp.d.ts` module-scoped `Document` shadow; fixed by moving the augmentation into `declare global`).
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 1 test file, 1 test passed (`src/App.test.tsx`).
  * `npm run build` — `tsc -b && vite build` exit 0; emitted `dist/index.html` and `dist/assets/index-*.js` (193.56 kB, gzip 60.51 kB).
* **Changed Files:**
  * `src/webmcp/webmcp.d.ts` — moved `Document` augmentation inside `declare global` (lint fix).
  * `index.html`, `src/main.tsx`, `src/App.tsx` — new minimal app shell (no MUI theming; deferred to T1.2).
  * `src/App.test.tsx` — new minimal render test.
  * `.gitignore` — added `*.tsbuildinfo`, `coverage`, `playwright-report`, `test-results`.
  * `tsconfig.tsbuildinfo` — untracked from git (generated artifact).
* **Result:** All T0.1 acceptance criteria met: `npm ci` succeeds from a clean checkout; lint/typecheck/test:run/build all pass; MIT `LICENSE` is present at repo root.
* **Next eligible task:** T0.2 (dependency T0.1 is now DONE). Not implemented in this run per instructions.
* **Notes:** Setting up Vite + React + TypeScript + Vitest + Testing Library + Zod + Zustand.

### Entry: T0.2 — Install the Agent Execution Harness
* **Status:** DONE
* **Depends on:** T0.1 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T0.2):**
  * `AGENTS.md` includes every minimum rule in Section 10.
  * All five owner-created harness files exist at the expected paths and are readable.
  * Implementation log has a table for task status, changed files, commands, results, blockers, and next task.
  * ADR 0001 records the local-first/no-backend contest decision and the post-contest Supabase seam.
* **Verification performed (no file edits required beyond this log entry; harness files are owner-authored):**
  * `AGENTS.md` checked line-by-line against BUILD_SPEC.md §10 "AGENTS.md minimum content": source-of-truth pointer ✓, one-task-at-a-time rule ✓, Zod runtime validation requirement ✓, `src/domain/commands.ts` write boundary ✓, authority-boundary prohibitions (imperative approval tool, `toolautosubmit`, outbound messaging/remote PII/third-party APIs) ✓, hallucinated-URL/raw-HTML prohibition ✓, required validation commands before DONE ✓, requirement to record evidence in the implementation log ✓. No gaps found.
  * Confirmed all five harness files exist and are readable: `AGENTS.md`, `docs/BUILD_SPEC.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/EVAL_RESULTS.md`, `docs/decisions/0001-local-first-contest-architecture.md`.
  * Also confirmed `docs/decisions/0002-adopt-mui-for-styling.md` exists, is a well-formed ADR (context/decision/consequences/rollback), and is cross-referenced from BUILD_SPEC.md's styling row (§ around line 599) and token section (§ around line 774) — the MUI dependency addition is reconciled with the spec, not a silent scope change.
  * `docs/EVAL_RESULTS.md` contains the canonical eval matrix (E-01–E-07) with columns for tools called, authority-kept, and pass/fail, ready to be filled during T3.1/T4.2.
  * ADR 0001 confirmed to record: client-only execution, `localStorage` persistence key `mend:recovery-planner:v1`, no external side effects, and an explicit post-contest Supabase (`RecoveryRepository`) seam — matches BUILD_SPEC.md's architecture decision.
  * `docs/IMPLEMENTATION_LOG.md` confirmed to carry a Master Task Status table (task/status/phase/description/artifacts) plus per-task Execution Entries recording planned files, validation commands, validation results, changed files, and next eligible task — sufficient for a new agent to resume without conversation context.
* **Reconciliation:** No discrepancies found between owner-authored harness files and BUILD_SPEC.md. No content was overwritten.
* **Changed Files:** None (verification-only task; this log entry is the only artifact produced).
* **Result:** All T0.2 acceptance criteria met. A new agent reading only the Master Task Status table can identify T0.2 as the completed task and T1.1 as the next `READY` task without conversation context.
* **Next eligible task:** T1.1 (dependency T0.1 is DONE; T1.1 does not depend on T0.2). Not implemented in this run.

### Entry: T1.1 — Build the Domain and Local State
* **Status:** DONE
* **Depends on:** T0.1 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T1.1):**
  * All commands return typed success/error results and make atomic changes.
  * Commands append sanitized activity events.
  * Agent cannot review plans or update task status.
  * Unsafe cases cannot stage plans or drafts.
  * Ungrounded deadlines and stale plan IDs are rejected.
  * Reload preserves state; reset removes it.
* **Planned Files:**
  * `src/domain/types.ts` (new) — canonical domain entities, command context/types, and result envelope.
  * `src/domain/schemas.ts` (new) — strict Zod schemas for command inputs, persisted state, and seed payloads.
  * `src/domain/invariants.ts` (new) — safety, deadline grounding, duplicate task, stale plan, and authority checks.
  * `src/domain/selectors.ts` (new) — derived selectors for approved/pending plans and allowed actions.
  * `src/domain/commands.ts` (new) — command service implementing atomic validated state transitions and activity append.
  * `src/state/persistence.ts` (new) — local-storage key contract, safe load/save/reset utilities.
  * `src/state/migrations.ts` (new) — `schemaVersion: 1` migration/reset behavior.
  * `src/state/recoveryStore.ts` (new) — Zustand store wiring with persisted sanitized domain state.
  * `src/data/resources.ts` (new) — curated static resource catalog with owned URLs.
  * `src/data/floodDemo.ts` (new) — deterministic seeded flood scenario with synthetic content.
  * `src/domain/commands.test.ts` (new) — unit tests for Section 9 invariants and authority boundaries.
  * `src/state/recoveryStore.test.ts` (new) — persistence/reset/migration determinism checks.
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 3 test files passed (`src/App.test.tsx`, `src/domain/commands.test.ts`, `src/state/recoveryStore.test.ts`), 12 tests passed total.
  * `npm run build` — `tsc -b && vite build` exit 0; emitted `dist/index.html` and `dist/assets/index-*.js`.
* **Changed Files:**
  * `src/domain/types.ts` — canonical domain entities, command result envelope, command interfaces, and base empty-state factory.
  * `src/domain/schemas.ts` — strict Zod schemas for command inputs, persisted state shape, and ISO date/date-time validation.
  * `src/domain/invariants.ts` — safety/authority/stale-plan checks, duplicate-title detection, deadline grounding, activity sanitization/capping, and allowed-action derivation.
  * `src/domain/selectors.ts` — compact snapshot selectors (`latestApprovedPlan`, `pendingPlan`, capped records/drafts/activity, allowed actions).
  * `src/domain/commands.ts` — atomic command implementations for case/record/plan/review/draft/task-status/reset with typed success/error results.
  * `src/state/persistence.ts` — localStorage load/save/clear helpers and key contract `mend:recovery-planner:v1`.
  * `src/state/migrations.ts` — schemaVersion migration path with safe fallback to empty state.
  * `src/state/recoveryStore.ts` — Zustand-backed domain store with transactional update helpers and persistence wiring.
  * `src/data/resources.ts` — curated, catalog-owned resource definitions and ID guard.
  * `src/data/floodDemo.ts` — deterministic flood seed workflow with synthetic records only.
  * `src/domain/commands.test.ts` — invariant/authority unit tests: safety block, duplicate tasks, ungrounded deadlines, stale plan IDs, agent review rejection, UI-only task-status updates, immutable approved plan behavior, outreach draft semantics.
  * `src/state/recoveryStore.test.ts` — persistence/reset/migration determinism checks.
* **Result:** All T1.1 acceptance criteria are satisfied:
  * Commands are typed and atomic with success/error envelopes.
  * Commands append sanitized activity for stateful actions.
  * Agent review and WebMCP task-status updates are rejected by command-level authority checks.
  * Unsafe cases cannot stage plans/drafts.
  * Ungrounded due dates and stale plan IDs are rejected with corrective validation/state-conflict errors.
  * Persisted reload succeeds and reset clears local data state.
* **Next eligible task:** `T1.2` (selected next in backlog order). `T2.1` is also now `READY` because `T1.1` is `DONE`.

### Entry: T1.2 — Build the Calm Responsive Shell
* **Status:** DONE
* **Depends on:** T1.1 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T1.2):**
  * The purpose and safety boundary are clear within the initial viewport at 390 × 844.
  * Blank and demo flows create visible cases.
  * WebMCP status has supported, unsupported, registering, and error states.
  * Page works from 320 px through desktop without horizontal scrolling.
  * All core controls have visible focus and 44 px targets.
* **Planned Files:**
  * `src/styles/theme.ts` (new) — MUI theme tokens per BUILD_SPEC design constraints.
  * `src/styles/global.css` (new) — global baseline + focus/target/overflow guardrails.
  * `src/components/WebMCPStatus.tsx` (new) — status badge + unsupported guidance states.
  * `src/components/SafetyBanner.tsx` (new) — explicit recovery-after-danger boundary.
  * `src/components/EmptyState.tsx` (new) — blank/demo start controls and local-only copy.
  * `src/components/CaseSummary.tsx` (new) — key case facts for early comprehension.
  * `src/app/AppShell.tsx` (new) — responsive shell composition and primary viewport hierarchy.
  * `src/app/ErrorBoundary.tsx` (new) — resilient app wrapper for non-fatal shell errors.
  * `src/App.tsx` (edit) — hook up command layer-driven blank/demo actions and shell state.
  * `src/main.tsx` (edit) — mount ThemeProvider + CssBaseline + global styles.
  * `src/components/T1Shell.test.tsx` (new) — component tests for status states, start flows, and safety visibility.
  * `src/App.test.tsx` (edit) — adapt baseline test to new shell assertions.
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 4 test files passed, 15 tests passed total (includes new shell tests).
  * `npm run build` — `tsc -b && vite build` exit 0; emitted CSS + JS bundles and `dist/index.html`.
* **Manual QA (required by task packet):**
  * Loaded app in browser at `390 × 844` and verified no horizontal overflow (`scrollWidth === innerWidth === 390`).
  * Keyboard tab traversal reached interactive controls including `Start a blank case` and `Load flood demo`.
  * Clicked `Load flood demo` and verified immediate visible `What we know` summary with seeded flood context.
* **Changed Files:**
  * `src/styles/theme.ts` — MUI token theme (palette, typography, radius, button size/focus baseline).
  * `src/styles/global.css` — global overflow/focus/reduced-motion rules.
  * `src/components/WebMCPStatus.tsx` — supported/unsupported/registering/error capability states and unsupported guidance.
  * `src/components/SafetyBanner.tsx` — explicit recovery boundary and emergency disclaimer copy.
  * `src/components/EmptyState.tsx` — blank/demo starts with local-only data statement.
  * `src/components/CaseSummary.tsx` — concise case facts panel for immediate comprehension.
  * `src/app/AppShell.tsx` — responsive shell composition and status/error placements.
  * `src/app/ErrorBoundary.tsx` — local-safe render fallback (no remote logging).
  * `src/App.tsx` — command-layer-driven blank/demo actions and shell state orchestration.
  * `src/main.tsx` — `ThemeProvider`, `CssBaseline`, global styles, and error boundary wiring.
  * `src/components/T1Shell.test.tsx` — start-flow + capability-state component tests.
  * `src/App.test.tsx` — shell baseline assertions updated to safety-boundary-first UI.
* **Result:** T1.2 acceptance criteria met:
  * Purpose/safety boundary and startup actions are visible in initial mobile viewport.
  * Blank/demo controls create visible case state through command-layer transitions.
  * WebMCP capability status includes supported/unsupported/registering/error representations.
  * Layout remains responsive from small mobile to desktop widths without horizontal scrolling.
  * Core controls are keyboard reachable and satisfy 44 px target floor via shared button theming.
* **Next eligible task:** `T1.3` (next in backlog order). `T1.4` and `T2.1` are also `READY`.

### Entry: T1.3 — Implement Plan Review and Next Actions
* **Status:** DONE
* **Depends on:** T1.1 (DONE), T1.2 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T1.3):**
  * A locally staged plan appears as `Needs your review`.
  * Approved plan remains current while a revision is pending.
  * Only a UI-sourced review command can approve/request changes.
  * Approval promotes tasks to the next-actions section without page reload.
  * `now`, `next`, and `later` ordering is deterministic.
* **Planned Files:**
  * `src/components/PlanReview.tsx` (new) — pending plan card + review form + status context.
  * `src/components/NextActions.tsx` (new) — approved plan tasks sorted deterministically with status controls.
  * `src/domain/selectors.ts` (edit) — deterministic task ordering helper and latest-plan convenience selectors.
  * `src/App.tsx` (edit) — compose case summary, pending review, and next-actions with command-layer handlers.
  * `src/components/T1PlanFlow.test.tsx` (new) — integration flow seed → stage plan command → approve in UI → reload persistence.
  * `src/domain/commands.test.ts` (edit) — add explicit UI-source review success and stale-state guard coverage if needed.
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 5 test files passed, 17 tests passed total (including T1.3 integration flow coverage).
  * `npm run build` — `tsc -b && vite build` exit 0.
* **Changed Files:**
  * `src/components/PlanReview.tsx` — pending-plan review card with explicit manual decision form (`Approve plan` / `Request changes`).
  * `src/components/NextActions.tsx` — approved-plan next actions with deterministic ordering and UI task-status controls.
  * `src/domain/selectors.ts` — deterministic priority/title/id task ordering selector.
  * `src/App.tsx` — integrates pending-plan review + approved-plan next actions and UI-sourced command handlers.
  * `src/components/T1PlanFlow.test.tsx` — integration coverage for seed → stage command → approve in UI → persisted approved plan on reload.
* **Result:** T1.3 acceptance criteria met:
  * Pending plans render as `Needs your review`.
  * Approved plan remains active while a revision is pending.
  * Review actions route through UI context and command-layer authority checks.
  * Approval promotes tasks to next-actions immediately (no reload required).
  * Task order is deterministic by `now` → `next` → `later`, then stable lexical/id tie-breaks.
* **Next eligible task:** `T1.4` (next in backlog order). `T2.1` and `T2.3` are also `READY`.

### Entry: T1.4 — Complete Supporting Case Views
* **Status:** DONE
* **Depends on:** T1.2 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T1.4):**
  * Every record/draft/activity entry includes type, author/actor, and timestamp as applicable.
  * Drafts visibly say `Draft — not sent`; no send control exists.
  * Resource badges link only to catalog-owned HTTPS URLs after a user click.
  * Reset requires confirmation and returns to the empty state.
* **Planned Files:**
  * `src/components/CaseRecordList.tsx` (new) — record list with type/author/time metadata.
  * `src/components/DraftList.tsx` (new) — unsent draft list with copy-only action and clear draft state label.
  * `src/components/ActivityTimeline.tsx` (new) — newest-first activity entries with actor/time context.
  * `src/components/ConfirmDialog.tsx` (new) — reusable confirmation dialog for destructive actions.
  * `src/components/NextActions.tsx` (edit) — resource badges sourced only from catalog IDs.
  * `src/data/resources.ts` (edit) — helper accessors for ID-to-resource lookups.
  * `src/app/AppShell.tsx` (edit) — reset entry point in global header.
  * `src/App.tsx` (edit) — wire records/drafts/activity views and reset confirmation flow through commands.
  * `src/components/T1SupportingViews.test.tsx` (new) — coverage for copy success/failure, actor labels, reset confirmation, and resource links.
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 6 test files passed, 21 tests passed total (includes supporting-view coverage).
  * `npm run build` — `tsc -b && vite build` exit 0.
* **Changed Files:**
  * `src/components/CaseRecordList.tsx` — record timeline with type/author/timestamp metadata.
  * `src/components/DraftList.tsx` — copy-only unsent drafts with explicit `Draft — not sent` labeling and copy success/failure feedback.
  * `src/components/ActivityTimeline.tsx` — newest-first activity events including actor/source/time.
  * `src/components/ConfirmDialog.tsx` — reusable confirmation dialog for destructive actions.
  * `src/components/NextActions.tsx` — official resource links rendered from catalog IDs only.
  * `src/data/resources.ts` — resource lookup helper for safe ID-to-URL resolution.
  * `src/app/AppShell.tsx` — header reset trigger (`Delete local case`).
  * `src/App.tsx` — reset confirmation flow + records/drafts/activity composition through command-layer state changes.
  * `src/components/T1SupportingViews.test.tsx` — copy success/failure, actor labels, resource link ownership, and reset confirmation assertions.
* **Result:** T1.4 acceptance criteria met:
  * Record, draft, and activity entries show required metadata (type + actor/author + timestamps).
  * Drafts are visibly unsent and expose copy-only behavior (no send control).
  * Resource links are drawn exclusively from the owned static catalog URLs.
  * Reset uses explicit confirmation and returns the app to the empty startup state.
* **Next eligible task:** `T2.1` (next in backlog order). `T2.3` is also `READY`.

### Entry: T2.1 — Add the WebMCP Platform Adapter
* **Status:** DONE
* **Depends on:** T1.1 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T2.1):**
  * App never crashes when `document.modelContext` is absent.
  * Adapter exposes register and cleanup without leaking browser details into domain code.
  * Tests can list and execute registered tools with a mock.
  * Re-registration aborts the old registration set.
* **Planned Files:**
  * `src/webmcp/modelContextAdapter.ts` (new) — capability detection and tool-set registration helpers.
  * `src/webmcp/registerRecoveryTools.ts` (new) — stateful registration lifecycle with cleanup + re-registration abort.
  * `src/test/modelContextMock.ts` (new) — model-context mock install/list/execute utility for deterministic tests.
  * `src/webmcp/registerRecoveryTools.test.ts` (new) — unsupported/supported/re-registration test coverage.
  * `src/webmcp/webmcp.d.ts` (edit) — promote WebMCP interfaces to global declarations for adapter/test typing.
  * `src/App.tsx` (edit) — route capability status through adapter registration lifecycle (unsupported/supported/registering/error).
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 7 test files passed, 24 tests passed total; includes new adapter lifecycle tests.
  * `npm run build` — `tsc -b && vite build` exit 0.
* **Changed Files:**
  * `src/webmcp/modelContextAdapter.ts` — WebMCP capability detection + safe tool registration wrapper.
  * `src/webmcp/registerRecoveryTools.ts` — registration manager with singleton cleanup and old-registration abort semantics.
  * `src/test/modelContextMock.ts` — mock model context for list/execute testing.
  * `src/webmcp/registerRecoveryTools.test.ts` — unsupported, supported+execute, and re-registration abort assertions.
  * `src/webmcp/webmcp.d.ts` — global `ModelContext` / `ModelContextTool` type declarations.
  * `src/App.tsx` — adapter-based capability status setup and registration cleanup on unmount.
* **Result:** T2.1 acceptance criteria met:
  * Unsupported environments render safely with no crashes.
  * WebMCP registration logic is isolated behind a local adapter and cleanup manager.
  * Mock tooling supports tool listing and execution tests.
  * Re-registration aborts/unregisters the prior registration set deterministically.
* **Next eligible task:** `T2.2` (next in backlog order). `T2.3` remains `READY`.

### Entry: T2.2 — Register Core Imperative Tools
* **Status:** DONE
* **Depends on:** T2.1 (DONE), T1.3 (DONE)
* **Acceptance criteria (BUILD_SPEC.md §T2.2):**
  * Tool names, descriptions, schemas, and annotations match specification.
  * Available tools change correctly for no-case, unsafe, safe, and pending-plan states.
  * Handlers read current state at execution time and reject stale operations.
  * UI updates visibly after successful tool calls.
  * Validation errors identify correctable fields without exposing internals.
* **Planned Files:**
  * `src/webmcp/toolDefinitions.ts` — define core imperative tools and state-aware filtering.
  * `src/webmcp/toolResults.ts` — canonical structured tool-result envelope mappers.
  * `src/webmcp/registerRecoveryTools.ts` — state-driven lifecycle integration for selected tools.
  * `src/webmcp/modelContextAdapter.ts` — registration safety/duplicate handling.
  * `src/App.tsx` — register and re-register selected tools as allowed actions change.
  * `src/webmcp/registerRecoveryTools.test.ts` — integration coverage for state-aware registration behavior.
  * `src/test/modelContextMock.ts` — richer model-context inspection helpers for tool contract assertions.
* **Validation Commands:** `npm run lint`, `npm run typecheck`, `npm run test:run`, `npm run build`
* **Validation Results (all passed):**
  * `npm run lint` — `eslint .` exit 0.
  * `npm run typecheck` — `tsc --noEmit` exit 0.
  * `npm run test:run` — `vitest run`: 8 test files passed, 30 tests passed total.
    * Includes new WebMCP integration coverage for state-aware registration, contract/schema assertions, stale operation rejection, and visible UI updates after tool execution.
  * `npm run build` — `tsc -b && vite build` exit 0.
* **Changed Files:**
  * `src/webmcp/toolResults.ts` (new) — canonical `ToolResult<T>` envelope + command-result mapping helpers.
  * `src/webmcp/toolDefinitions.ts` (new) — core imperative tool contracts (`get_recovery_snapshot`, `create_recovery_case`, `add_case_record`, `stage_recovery_plan`) with exact descriptions/schemas/annotations and state-aware filtering.
  * `src/App.tsx` — state-driven tool registration keyed to allowed-action changes and cleanup lifecycle.
  * `src/webmcp/registerRecoveryTools.ts` — development-safe registration-name logging and lifecycle reuse.
  * `src/webmcp/modelContextAdapter.ts` — duplicate tool-name guard in registration sets.
  * `src/test/modelContextMock.ts` — registered-tool metadata inspection helper (`listRegisteredTools`).
  * `src/webmcp/registerRecoveryTools.test.tsx` (new) — registration lifecycle + UI integration tests (replaces `.test.ts`).
  * `src/webmcp/registerRecoveryTools.test.ts` (deleted) — superseded by `.tsx` test with UI integration.
  * `src/webmcp/toolDefinitions.test.ts` (new) — exact contract checks, availability-by-state checks, stale-operation, and validation-error envelope tests.
  * `src/vite-env.d.ts` (new) — Vite client type reference for test/runtime `import.meta` typing.
* **Result:** T2.2 acceptance criteria met:
  * Core tool names/descriptions/schemas/annotations match BUILD_SPEC Section 5.
  * Registered tool availability transitions correctly for no-case, unsafe, safe, and pending-plan states.
  * Handlers resolve current store state at execution time; stale add-record operations are rejected with `state_conflict`.
  * Successful tool calls immediately update visible UI state via shared command-layer mutations.
  * Validation failures return correctable field-level hints without stack traces or internal implementation details.
* **Next eligible task:** `T2.3` (next in backlog order). `T2.4` remains blocked behind T2.2 plus core critical-path completion policy.