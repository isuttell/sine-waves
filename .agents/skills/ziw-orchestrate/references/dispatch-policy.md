# Dispatch Policy

Use this reference when deciding scope boundaries, worker concurrency,
file-footprint contention, draft PR handling, or PR closure.

## Scope Boundaries

Orchestrator owns delivery scope only for work the user explicitly named or for
the configured current-work queue. Do not expand into adjacent tickets just
because they are nearby or cheap.

- Explicit ticket IDs or URLs are a fixed set.
- A one-ticket request remains one ticket through implementation, review, and
  integration.
- A verified-ready ticket set can be repaired and advanced, but not widened.
- Linear Backlog work is not dispatchable until triage promotes committed,
  shaped work into the ready state.
- Done tickets are terminal even when stale readiness labels remain.

When a scoped ticket is not moving, verify the fact that would make it eligible
for the next pipeline step. Repair routine status, label, route, environment,
review-evidence, or handoff drift when refreshed evidence is clear. Escalate
only missing intent, authority, credentials, provider/customer input, production
approval, security posture, or ADR-level judgment.

## Worker Concurrency

The worker cap controls active implementation or repair sessions. Default to 3
workers when config names no cap. Use `Worker concurrency cap`.

Count:

- implementation dispatches that have not returned, stopped, or produced a PR
- active worker continuations repairing checks, review findings, or conflicts
- confirmed provider sessions represented by repo-scoped tracker claims

Deduplicate session, issue, branch, and provider handles. A human assignee, open
PR, preview, or abandoned worktree is not an active worker. They still affect
ownership, file collision, provider limits, and the PR action queue.

Every tick advances actionable PR state and fills all remaining worker slots
with safe ready work. A returned, failed, stopped, or PR-producing worker frees
its slot immediately. Backfill it in the same tick. Merge may serialize, but PR
inventory must never suppress unrelated implementation dispatch.

If a slot remains idle while ready non-colliding work exists, record an
orchestrator failure. Explicit collision, missing footprint, worker authority,
provider capacity, or configured budget policy are valid hold reasons.

## File Footprint Dispatch

Before dispatching more than one
startable issue, compare predicted footprints from To Issues against:

- open PRs, including drafts
- active worker branches and unreturned dispatches
- selected candidates for the same tick
- shared packages, schemas, migrations, generated artifacts, route files, config
  files, and refactor-plus-test seams
- dense document hotspots such as changelog lists, status ledgers, registries,
  config tables, and caveat lists

Dispatch the largest non-colliding set that fits worker headroom. Hold colliding
items as `file-collision` with "held, not skipped" evidence.

If the snapshot has no predicted footprint for a startable ticket, derive it in
the same tick from the body's likely files, packages, or artifacts. Route the
ticket to triage or To Issues only when the body itself lacks them. While that
repair is pending, the first selected ticket may still start with an unknown
footprint when there is no active work at all, as the main skill allows.

Prefer the set that unlocks blocked dependents, then backlog priority. Fill every
slot for which safe work exists.

Collision checks are concrete. Compare predicted files, packages, generated
artifacts, schemas, migrations, routes, and dense shared documents. Do not turn
an area label such as `e2e`, `schema`, or `security` into a whole-category lock
without evidence that the active and candidate footprints overlap.

## Worker Routing And Budget

Startability answers whether the work may begin. Worker eligibility answers who
may own it. Dispatch selection combines those facts with capacity and collision
evidence. Keep all three visible in the tick result.

- Select work by leverage and backlog priority, not by worker provider.
- Remote ineligibility does not make a startable ticket globally blocked. Check
  the configured local worker path.
- Below the configured local soft stop, start the highest-leverage local-only
  ticket, subject to the configured per-tick local limit. Prefer work that
  unlocks the dependency chain.
- At the local soft stop, pause new local-heavy starts and keep remote workers
  running.
- At the local hard stop, stop new local starts and keep authorized remote work running.
- Record an explicit authority or hold reason for every startable ticket that is
  not selected.

The deterministic planner accepts `eligibleWorkers` (aliases: `workerPaths`,
`allowedWorkers`, or `workers`) on startable tickets. It accepts
`localBudgetUsagePercent` in state and these config values:
`remoteWorkerPaths`, `localWorkerPaths`, `localBudgetSoftStopPercent`,
`localBudgetHardStopPercent`, and `localStartsBelowSoftLimit`. When budget state
is absent, no budget thresholds are inferred and untyped dispatch behavior
remains unchanged.

## Dispatch Preconditions

Dispatch only when current tracker and code-host evidence show all of these:

- ticket is `kind-slice`
- readiness state and label satisfy config
- issue body has concrete in-scope, out-of-scope, acceptance, and verification
  content
- dependencies and blocker relations are clear
- repo route and worker environment metadata are present or safely repairable
- ticket is not claimed, delegated, linked to an open PR, or represented by an
  active worker session
- predicted footprint does not collide with active or selected work

A `kind-spec` or `kind-epic` at dispatch is a hard refuse. Treat it as a To
Issues miss, repair only when unambiguous, and log `config-gap`.

Body or comment evidence can override readiness. If the body says it waits on a
human decision, contains a ready-for-human rationale, leaves required sections
blank, or names unresolved setup, credential, provider, or security choices, do
not dispatch. Heal the label or route to triage.

## Draft PRs

Draft PRs are active code-host work and consume file seams, not worker capacity
by themselves. Do not start another worker for the same ticket because the
returned PR is draft.

Draft state is an orchestration repair signal. Find the blocker: running or
failed checks, requested author fixes, missing metadata, human prep, or an
explicit repo policy. When no blocker remains, move the PR to ready-for-review if
authority allows. If authority is missing, stop with the exact code-host action
needed.

## PR Closure Guard

Capacity pressure is never a reason to close legitimate in-progress work. Before
closing any PR, refresh code-host and tracker state and verify one closure
reason:

- duplicate PR for the same issue after current evidence selects a canonical PR
- explicitly canceled, abandoned, or out-of-scope work, with owner or config
  evidence that closure is allowed
- already merged, superseded, or terminal according to code-host and tracker
  evidence
- security or policy reason requiring closure, with the reason recorded

PR age, draft status, and delivery-slot pressure are not abandonment evidence.
An open PR occupies its concrete file seam, not a worker slot. Keep it open and
route the next action: review, worker feedback, check repair, or merge.
