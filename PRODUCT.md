# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mend serves an adult coordinating household recovery after a residential flood, fire, storm, or temporary displacement—after immediate danger has passed. They may be stressed, short on time, on a phone, and coordinating evidence, lodging, expenses, insurance, and communications for other household members.

The contest demonstration follows a renter whose apartment flooded after a burst pipe. Their partner uses a wheelchair, temporary lodging ends Friday, and the landlord requested photos.

## Product Purpose

Mend turns a difficult recovery narrative into a small, structured, reviewable recovery workspace. A browser agent can capture facts and stage proposed work; the person remains the decision owner and must explicitly approve any recovery plan.

Success means the person can quickly identify the next useful action, preserve the facts that matter, and return later with a clear record of what was proposed, approved, and completed.

## Jobs to Be Done

- **When a disruption creates many unfamiliar obligations,** help me see what matters now so I can take the next useful action.
- **When information is scattered across messages and memory,** help me create one factual record without translating my situation into a long form.
- **When an agent prepares a plan,** let me understand, change, and explicitly approve it before it becomes my active plan.
- **When I return later,** show me what was decided, what remains open, and why each task exists.

## Positioning

Mend is a human-first recovery workspace, not an autonomous case manager. Its differentiated mechanism is a shared command layer: typed WebMCP tools and visible interface controls produce the same local, auditable state while the approval boundary remains exclusively human-controlled.

## Operating Context

### Primary agent-assisted journey

1. The person confirms that immediate danger has passed and opens Mend.
2. They load the synthetic flood demo or describe their situation to a browser agent.
3. The agent reads the current case, records validated facts, and stages a short prioritized plan.
4. Mend displays the proposal as **Needs your review**; it is not active yet.
5. The person reviews, changes if needed, and manually submits **Confirm decision**.
6. Mend promotes the approved plan’s ordered tasks to **Next actions** and preserves activity history.

### Normal-browser support journey

Mend loads without an account or WebMCP. In this contest build, a person can load the demo, read the case, review already-staged work, update task status, copy unsent drafts, and delete local data. Complete manual fact entry and plan authoring are intentionally not included; they are a post-contest product opportunity that requires affected-user research.

## Capabilities and Constraints

- WebMCP tools read the current case, create a local case, add factual records, stage recovery plans, and create copy-only outreach drafts.
- A declarative `start_plan_review` form can focus and prefill the review interface, but has no auto-submit path.
- Plans require a visible manual submit with `actor: user`; an agent cannot approve a plan or change task status.
- Safety status blocks planning and drafting until immediate danger is resolved.
- Task deadlines must be grounded in recorded deadline facts.
- Outreach drafts remain local and explicitly say **Draft — not sent**. Mend cannot send messages, upload files, submit applications, or contact third parties.
- State is stored only in browser `localStorage` under `mend:recovery-planner:v1`; no account, analytics, backend, cloud sync, or remote personal-data storage exists in the contest build.
- Mend is not emergency, legal, medical, financial, insurance, or benefits advice.

## Evidence on Hand

- `docs/EVAL_RESULTS.md` records the E-01 through E-07 evaluation outcomes.
- `docs/evidence/t4.2/` contains operator runbooks and production WebMCP evidence.
- `tests/e2e/` verifies deterministic mobile and desktop journeys, persistence/reset, and browser accessibility against local fixtures.
- `docs/BUILD_SPEC.md` is the authoritative contest build contract and detailed technical specification.

## Product Principles

1. **Safety before workflow.** Do not plan while immediate danger is active or unconfirmed.
2. **Calm before density.** Lead with the next useful action and reveal supporting detail in context.
3. **Draft before commitment.** Agent-created plans and messages remain proposed until the person acts.
4. **Visible agency.** Show every change in the interface and activity history, with its actor and source.
5. **Facts before inference.** Preserve case facts; clearly treat agent reasoning as a proposal.

## Accessibility & Inclusion

Mend is designed for stressed, mobile, and keyboard users: it uses direct language, visible focus, large controls, semantic forms and time elements, live status messages, and no motion required for understanding. The demonstration scenario includes accessible-housing and mobility constraints so the plan’s priorities reflect household realities.
