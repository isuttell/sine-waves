# Code Review Checklist

Use this as a bug taxonomy, not as a script to recite. State zero-finding categories only when useful for the final verdict.

## Severity

- P0: exploit, data loss, irreversible destructive action, credential exposure, or guaranteed outage.
- P1: correctness, security, authorization, migration, concurrency, or API-contract bug that can break a real workflow.
- P2: important regression, missing edge-case handling, test gap around risky behavior, or maintainability issue with clear failure mode.
- P3: style, naming, preference, or optional cleanup. Suppress by default.

## Evidence Gate

Before reporting a finding:

1. Quote or cite the exact source line that creates the risk.
2. Explain the concrete failure path, not just the pattern name.
3. Check for framework or repo conventions that intentionally handle it elsewhere.
4. Assign confidence from 1 to 10.
5. Suppress findings below confidence 5 unless impact would be P0/P1.

Confidence guide:

- 9-10: verified by reading source and the failure is concrete.
- 7-8: high-confidence pattern with enough local evidence.
- 5-6: plausible but needs maintainer verification; keep concise.
- 3-4: suspicious but too speculative for the main report.
- 1-2: do not report unless catastrophic.

## Critical Categories

### Scope and intent

- Does the diff deliver the requested behavior?
- Are acceptance criteria or issue requirements missing?
- Are unrelated refactors, formatting sweeps, or package changes mixed in?
- Does the diff deliver adjacent ticket work, optional polish, future-proofing,
  or new surfaces that the issue marked out of scope?
- Did tests/docs/status ledgers change when the behavior contract changed?

### Auth, authorization, and secrets

- New route, command, worker, job, or API path lacks the expected auth gate.
- Authorization checks use identity but miss workspace, tenant, role, resource ownership, or capability scope.
- Claim, bootstrap, invitation, or ownership flows trust a supplied `userId`,
  owner ID, or tenant ID instead of binding the operation to the authenticated
  actor and authorized tenant.
- Tokens, session cookies, service credentials, or secrets are logged, returned to clients, written to artifacts, or committed.
- A "local only" or "admin only" path is reachable from production routing.

### Data safety and persistence

- Destructive update/delete lacks a `WHERE`, tenant/workspace filter, transaction, or idempotency key.
- Multi-step write can partially commit without rollback.
- Schema migration is not compatible with the code path being shipped.
- Retention, cleanup, or queue code can delete current or pinned data.
- New persisted fields are not validated, normalized, or bounded.
- Deletion, retention, revocation, or lockdown commits durable state without the
  required invalidation or cleanup path.
- A new caller path reuses an existing destructive repository method but does not
  return or resolve the metadata needed for invalidation, audit, or recovery.

### SQL and query construction

- User-controlled values are interpolated into SQL, filters, object keys, sort keys, or column names without allowlisting.
- Query joins or filters omit tenant/workspace boundaries.
- Pagination or date filters are unstable, unbounded, or inconsistent.

### Concurrency and background work

- Read-modify-write happens without atomic update, transaction, version check, lock, or idempotency guard.
- Queue handlers assume one worker, one delivery, or no retry.
- Cron jobs or delayed work can overlap and double-apply effects.
- Async work continues after request context, transaction, or cancellation scope ends.
- Idempotent workflows cover the primary write but leave optional side effects
  outside the key, such as notifications, enqueueing, provider calls, or token
  minting.
- One-use grants, bootstrap claims, invitation accepts, or custody transfers are
  checked and consumed in separate non-atomic steps, allowing double claim,
  replay, or actor swap under concurrent attempts.
- Replay hooks work for one principal type but skip another principal accepted by the route contract; completed retries should replay before rate limiting for every accepted actor.

### API and contract compatibility

- Public request or response schema changed without corresponding client, CLI, docs, OpenAPI, or tests.
- New enum/status/type value is not handled in every switch, serializer, parser, renderer, and CLI output path.
- Error shape, status code, retry behavior, or pagination semantics changed accidentally.
- Error translation or route contracts are updated for one execution path but not
  every wrapper, transport, CLI path, or worker path that exposes the same error.
- Generated artifacts are stale.
- Tool/API implementation diverges from the governing ADR, spec, tracker issue, or runbook. Either implement the documented contract or update the source of truth in the same change.
- Forwarded-call metadata, route contracts, output schemas, implementation behavior, docs, and tests disagree about required side effects or returned fields.

### LLM and untrusted output

- Model output is trusted as code, SQL, shell input, HTML, file path, API operation, or DB row without schema validation and escaping.
- Prompt assembly lets user text override system or developer instructions.
- Parser assumes the model always returns valid JSON, required fields, or bounded text.
- Failure, refusal, rate-limit, or timeout path is missing.

### Shell, filesystem, and path safety

- Shell command uses interpolated strings instead of argv arrays.
- File paths from user, archive, API, model, or config input are not normalized and checked against an allowed root.
- Temp files can collide, leak, or be read before write completion.
- Archive extraction allows traversal or oversized files.

### Frontend and rendering

- User or model content is rendered as raw HTML or unsafe markdown.
- Client/server boundary leaks secrets or privileged data.
- Loading, empty, error, and permission states are missing for new user-facing flows.
- Form validation differs between client and server in a way that can bypass server rules.

### Time, money, and external systems

- Time comparisons mix local time and UTC, ignore DST, or use non-monotonic clocks for expiry.
- Payment, quota, metering, billing, or rate-limit changes lack idempotency and retry handling.
- External API calls ignore timeout, retry, partial failure, backoff, or duplicate delivery behavior.
- External model, provider, or driver integration assumes a response or adapter
  shape that was not verified against the real provider, driver, or generated
  artifact.

### Configuration and operational limits

- Numeric config changes lack a reason tied to production load, upstream/downstream limits, or measured behavior.
- Connection pools, worker counts, queue depths, cache sizes, timeouts, retries, and rate limits changed without considering the full concurrency path.
- Debug flags, verbose logging, wildcard hosts/origins, admin endpoints, or management routes can reach production.
- Rollback and monitoring signals are unclear for a risky config change.

### Tests and verification

- Risky behavior lacks a test that would fail for the bug being reviewed.
- A required acceptance criterion or named required test has no direct evidence;
  a test for nearby behavior is reported as coverage for the wrong item.
- Tests assert implementation details while missing user-visible behavior.
- Tests pass only in local order or share state across cases.
- Smoke or integration checks are skipped where the changed path is cross-package or runtime-dependent.
- Mock-based tests fabricate driver, provider, auth, or request internals in a way
  that can mask the integration bug the change is meant to prevent.
- CI env vars, feature flags, or test gates are set in workflow config but may be
  stripped by the task runner, shell, or env filtering before reaching the test
  process.
- Local verification does not match CI scope, thresholds, cache mode, generated
  artifact checks, or secret-scan range.
- Idempotency tests only cover first success, not completed retry, in-flight retry, retry after optional side effects, and retry under rate-limit pressure.
- Destructive or revocation tests assert database state but not the externally
  visible API behavior after invalidation, such as old URLs or handles failing.
