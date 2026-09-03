# Mend

A calm, local-first recovery workspace where browser agents handle the administrative burden of household disruptions while people retain complete authority over every decision.

---

## Why WebMCP?

Disaster recovery involves fragmented records, tight deadlines, complex communications, and emotional fatigue. Conventional web agents struggle here: they must scrape unstructured DOM trees, guess form structures, and blindly click buttons without deterministic feedback.

**Mend** provides native WebMCP tools (`document.modelContext`) that give visiting agents structured, state-aware access to the recovery workspace:
1. **Read context safely:** Inspect facts, active plans, and constraints without scraping.
2. **Stage draft work:** Propose action plans, categorize records, and draft communications directly through the shared application command layer.
3. **Preserve human sovereignty:** Staged plans cannot be auto-approved or executed by the agent. Every consequential action requires a physical click or keyboard confirmation through an accessible declarative review interface.

---

## Tool Inventory & Boundaries

| Tool | Mode | Purpose | Authority boundary |
| :--- | :--- | :--- | :--- |
| `get_recovery_snapshot` | Imperative | Returns active case facts, tasks, and allowed actions | Read-only; untrusted content hinted |
| `create_recovery_case` | Imperative | Initializes a structured local case | Halts immediately if danger is active |
| `add_case_record` | Imperative | Appends factual evidence or received messages | Plain text only; ungrounded dates rejected |
| `stage_recovery_plan` | Imperative | Proposes 1–6 prioritized recovery tasks | Staged as `pending_review`; cannot self-approve |
| `stage_outreach_draft` | Imperative | Drafts an unsent message to a landlord or insurer | Staged locally; copy-only; no outbound transport |
| `start_plan_review` | Declarative | Prefills and focuses the human review interface | Human-in-the-loop gate; strictly no auto-submit |

---

## Quickstart

### Prerequisites
* Node.js 20+
* Chrome 149+ (with `chrome://flags/#enable-webmcp-testing` enabled) or ChatGPT In-App Browser

### Development Setup

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Run quality checks
npm run lint
npm run typecheck
npm run test:run
npm run test:e2e
npm run build
```
