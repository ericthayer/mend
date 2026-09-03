# Mend — Copilot Workspace Instructions

## Primary Directives
- Read `docs/BUILD_SPEC.md` as the authoritative source of truth.
- Follow task ordering in `docs/IMPLEMENTATION_LOG.md`. Only work on the current READY task.
- All state changes (UI or WebMCP) must dispatch through `src/domain/commands.ts`. Never mutate store state directly.
- Runtime input validation with Zod is mandatory for all boundary inputs.

## Strict Architectural Guardrails
- **No Backend:** Do not add Supabase, Firebase, Express, database packages, or authentication. Local storage only (`mend:recovery-planner:v1`).
- **No External Side Effects:** No external network requests, outbound SMS/email, webhooks, or file uploads. Message drafts are strictly local and copy-only.
- **Human Authority Boundary:** 
  - Never implement an imperative approval tool.
  - Never add `toolautosubmit` to `<form toolname="start_plan_review">`. Plan approvals require a manual click/key submit with `actor: "user"`.
- **No Fabricated Data:** Reject ungrounded deadlines (tasks with `dueAt` require an existing deadline record in the case ledger). Never invent external URLs—use catalog IDs from `src/data/resources.ts`.

## Verification Commands
Before marking any task complete, ensure the following commands succeed:
- `npm run lint`
- `npm run typecheck`
- `npm run test:run`
- `npm run build`