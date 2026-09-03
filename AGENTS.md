# Agent Execution Guidelines — Mend

You are operating as an autonomous software engineer on Mend. Your work is governed by `docs/BUILD_SPEC.md` as the single source of truth.

## Operating Rules

1. **Strict Backlog Order:** Only select tasks marked `READY` whose dependencies are marked `DONE` in `docs/IMPLEMENTATION_LOG.md`. Work on one task at a time. If no task is `READY` with all dependencies `DONE`, do not start any work; record 'no eligible task' in `docs/IMPLEMENTATION_LOG.md` and stop.
2. **Shared Command Layer:** Every UI action and WebMCP tool handler must dispatch through `src/domain/commands.ts`. Never mutate store state directly from a component or tool handler.
3. **Runtime Validation:** Validate all external, user, and agent inputs using Zod schemas at runtime. TypeScript types alone do not constitute boundary safety.
4. **Authority Boundary:**
   * Never implement an imperative approval tool.
   * Never add `toolautosubmit` to declarative review forms.
   * Never add outbound messaging transports, remote PII storage, or third-party APIs.
5. **No Hallucinated URLs or Markdown Injection:** Use curated resource IDs from `src/data/resources.ts`. Never render unescaped or raw HTML from user or agent inputs.
6. **Execution Harness:**
   * Before modifying code, record the task ID, planned files, and validation command in `docs/IMPLEMENTATION_LOG.md`.
   * Run `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build` after changes.
   * Record the exact test command and terminal output summary before marking the task `DONE`.
   * If blocked for more than 15 minutes, apply the documented fallback from `docs/BUILD_SPEC.md` or stop and record the blocker.
