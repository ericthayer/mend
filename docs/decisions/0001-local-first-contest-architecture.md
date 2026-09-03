# 0001. Local-First Architecture and Contest Boundary

* **Status:** Accepted
* **Date:** 2026-09-02
* **Deciders:** Product Lead, Engineering

## Context

Mend is an emergency recovery workspace built for the WebMCP Challenge. Disasters involve sensitive personal data (housing status, damages, landlord disputes). Contest evaluation requires a zero-friction judge experience with instant load times, zero authentication barriers, and verified WebMCP tool operation.

AI coding agents often attempt to scaffold cloud persistence, user auth, and server-side APIs when encountering structured case models.

## Decision

For the contest MVP:
1. **Client-Only Execution:** Mend runs entirely in the browser using React, TypeScript, and Vite. There is no backend, serverless function, or database service.
2. **Local Persistence:** All domain state is validated via Zod and stored in `localStorage` under the key `mend:recovery-planner:v1`.
3. **No External Side Effects:** No external network requests, third-party messaging transports (SMS, email), analytics, or PII uploads are permitted.
4. **Architectural Seam:** State commands interact with domain stores through clean functional boundaries so storage mechanisms can be swapped post-contest without modifying WebMCP tool signatures.

## Consequences

* **Positive:** Zero hosting costs, zero credential management for judges, instant responsiveness, guaranteed privacy for users, and strict elimination of backend failure modes during judging.
* **Negative:** Data does not synchronize across devices; clearing browser storage deletes the case.

## Post-Contest Evolution (Deferred)

Following contest submission and judging freeze (after September 21, 2026), persistent multi-device recovery may be implemented via a `RecoveryRepository` adapter backed by Supabase (Auth, Postgres with Row-Level Security, and encrypted Storage for damage photos). Do not install or configure these dependencies in the contest branch.