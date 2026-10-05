---
name: ziw-to-issues
description: Use to turn a spec, PRD, or epic ticket into the fewest dependency-ordered one-PR implementation tickets that ship safely, adopting and merging any hand-created tickets, applying the agent-ready body contract, configured estimates, and kind labels, and emitting a dependency graph and predicted file footprint.
argument-hint: "[spec-doc|prd-ticket|epic-ticket|project]"
---

# To Issues

The single front door for implementation tickets, including hand-created ones.
To Issues creates and shapes tickets; it does not implement, review, open PRs,
merge, deploy, or move active work. Flows that file tickets elsewhere, such as
review sweeps or eval sessions, must run this intake pass or leave readiness
labels off. A `ready-for-agent` ticket without intake metadata is a dispatch
hazard.

For encountered friction, use [friction-log.md](../ziw-orchestrate/references/friction-log.md)
with the configured complaint store and this role's mutation authority.

## Inputs

- A spec, PRD, epic ticket, plan, or project. A Grill-managed spec must be
  `Ready for slicing`.
- Repo path and `docs/agents/workflow/config.md`. Read config first; if it is
  missing, run or request `ziw-setup` before creating tickets.
- Existing tickets under the same parent, project, or route, including
  hand-created ones.

Before any tracker write, confirm from config: provider location, project, team,
parent, and routing label; status names, ready state, and intake states; kind,
readiness, risk, type, and area labels and their policies; estimate field,
scale, and requiredness; body contract; dependency and blocker fields; footprint
convention. Read the body contract, label rules, and Estimate Rules from
[../ziw-setup/references/issue-tracker-contract.md](../ziw-setup/references/issue-tracker-contract.md).

## Planning Handoff

- `Status: Ready for slicing`, or its configured equivalent, may proceed.
- `Status: Draft`, or its configured equivalent, stops; report its blocking
  questions. If the user explicitly
  asks to preserve it, create or update only a non-ready `kind-spec` or
  `kind-epic` container carrying the gaps.
- A legacy plan without status proceeds only when outcome, scope, non-goals,
  behavior, acceptance signals, and material open questions are clear enough
  for the ticket contract.
- A contradiction or question that could change slice boundaries, risk,
  dependencies, or required proof returns to `ziw-grill`. Never invent the
  decision.

Existing tickets do not weaken this gate; adopt them only once the source
defines their boundaries.

## Kinds

Kind is separate from type. Set exactly one kind on every ticket you touch and
clear any other `kind-*`, even when the tracker group allows several.

- `kind-spec` (spec or PRD prose) and `kind-epic` (parent or workstream) are
  containers. Read their prose, linked docs, and acceptance signals, and link
  emitted slices under them. Never mark them `ready-for-agent` or dispatch them.
- `kind-slice` is a one-PR implementation ticket, the only kind a worker runs.

## Adopt Before Creating

Re-runs converge; they never duplicate. Before creating any ticket:

1. Inventory existing tickets under the target. Match planned slices by
   outcome, scope, and area, and adopt each match: bring it to the body
   contract, set `kind-slice`, and fix labels and links.
2. Create new `kind-slice` tickets only for planned work with no match.
3. When two tickets cover one slice, keep the canonical one and mark the other
   a duplicate.
4. Fold unstarted tickets that fail the merge test into one canonical unstarted
   ticket: carry over scope, acceptance criteria, spec citations, and
   footprint, re-estimate, repoint dependency links and coverage rows, and mark
   the rest duplicates.
5. Never fold into or out of a ticket that is claimed, active, or linked to an
   open PR. A fragment whose partner is active stays open, blocked by it, with
   `needs-info` asking whether the partner's PR covers it. Once the partner is
   Done, close it as covered or reshape it as its own slice.
6. Preserve and report tickets the plan does not cover, such as worker
   follow-ups or review debt. Do not fold them or mark them duplicates.

Adoption fixes mechanics from plan evidence. It never invents scope or criteria;
where intent is unknowable, apply `needs-info` with the exact question.

## Slice

Cut the fewest one-PR slices that ship safely. Each slice costs a worker
session, a check run, a review, a PR, and a merge, so default to the larger
slice and split only for a split reason.

A slice is one outcome that a user, operator, or later slice can observe, with
everything needed to ship it: code in every layer, tests, docs, config,
fixtures, generated artifacts, and migration. It is verifiable end to end, fits
one PR, and its Done never requires multiple PRs.

Ticket only requirements the plan states. Unrequested polish, cleanup,
hardening, future-proofing, and follow-ups you thought of are not tickets: name
tempting ones in out-of-scope and raise important ones as open questions on the
container. Leave vague ideas un-ticketed until scope is clear; record them as
open questions. Do not bundle unrelated outcomes, unrequired
adjacent fixes, or work the plan assigns to another slice. A merge-test batch
of trivial same-area items is one outcome, not a bundle.

### Split Reasons

Keep work in separate slices only for:

- Distinct outcome: each is observable and useful alone, and neither exists
  only to serve the other.
- Size: together they exceed one reviewable PR or the configured estimate
  maximum. Start with a tracer bullet that proves the path end to end, then
  widen with slices that each add observable behavior.
- Rollout order: a deploy gate separates the steps, such as data cleanup before
  a schema change or a flag or preview flip after the code it enables. Put
  gated slices under a `kind-epic` so the first PR cannot close the whole scope.
- Risk or authority: one part needs human planning, security judgment,
  production approval, or a different risk label.
- Readiness: one part waits on an open question or external dependency while
  the rest can start.

Never split by layer (schema, API, UI), artifact type (tests, docs, types,
config), file or module, work step (scaffold, wire up, clean up, verify), spec
section, or acceptance criterion.

### Merge Test

A slice matching any line below is a fragment, not a ticket, unless a split
reason separates it from its fold target. Any split reason keeps it apart,
including the no-behavior lines: a gated flag flip or an expand-only migration
stays its own slice.
Depending on a sibling does not make a fragment; lacking observable
behavior of its own does. "Another slice" means an unmerged one; work for
behavior that already shipped stands alone.

- No consumer or observable behavior in its own PR (scaffold, types, interface,
  stub, config, wiring): fold into the first slice that uses it.
- Only tests, docs, fixtures, or generated artifacts for another slice's
  behavior: fold into that slice.
- A step, not a change (run checks, verify deploy, confirm migration, open PR):
  make it an acceptance criterion or required check on the slice it verifies.
- One mechanical change repeated across files, modules, or call sites: one
  slice unless size forces a split.
- Trivially small (rename, copy tweak, config value, one-line fix) with other
  planned work in the same area: fold it in, or batch trivial items that share
  area, risk label, and required checks into one slice whose single outcome
  covers the group, such as "settings copy matches the spec". A small fix that
  is the whole request stays one ticket.
- Shares most of its predicted footprint with the one slice it blocks or is
  blocked by.

### Consolidate Before Writing

Draft the whole slice list before any tracker write, then:

1. Name the split reason separating each slice from every slice it blocks, is
   blocked by, or shares files with.
2. Apply the merge test and merge each pair with no split reason. In a chain
   where each slice only unblocks the next, merge only the links without one;
   a rollout gate keeps its two links apart.
3. Re-split any merged slice that no longer fits one PR, on a split reason.
4. Record each split reason in the slice's dependencies or blockers section so
   triage can see it, and list it in the run summary.

## Body Contract

Every `kind-slice` gets the agent-ready body: outcome; context docs; likely
files, packages, or artifacts; in scope; out of scope; acceptance criteria;
required checks; security, privacy, data, and operational invariants;
dependencies or blockers; and estimate when config stores it in the body.

- Scope is a hard stop line. `In scope` names only the behavior, files, docs,
  tests, and workflow state this PR may change. `Out of scope` names tempting
  adjacent work, sibling ticket IDs when known, optional polish, broad refactors,
  production actions, and follow-up behavior. If the boundary is too unclear to
  write, keep the work under a container or mark it `needs-info`.
- In context docs, cite the exact spec, PRD, or ADR sections a slice implements
  as resolvable anchors, such as `docs/specs/<file>.md#<section-anchor>`, and verify each
  resolves. Do not paraphrase spec behavior without a citation or cite a whole
  document when sections apply. A spec-derived slice without resolvable
  citations is not ready.
- Write acceptance criteria as proof obligations that map one-for-one to
  evidence. For structural requirements such as "derive, do not copy", "fail
  closed", "no production-path assertion", "real driver path", or "env var
  reaches the test process", name the exact behavior and regression test.
- Make deploy prerequisites, runtime secrets, hosted gates, generated artifact
  updates, and CI env passthrough explicit acceptance criteria or required
  checks, not background-doc notes.
- Put exact external literals (config values, resource IDs, provider names,
  label slugs, secret names, environment values) or their config lookup
  location in the body, not only in prior comments.
- Auth, bootstrap, claim, invitation, one-use grant, custody, or ownership
  slices name the authenticated actor, tenant or resource binding, replay
  behavior, atomic consume or claim, and concurrency checks before ready.
- Custody, persistence, driver, or provider integration slices get executable
  criteria that exercise the real boundary, such as multi-instance readback,
  concurrent first use, real driver queries, env passthrough, or provider-shape
  checks, not prose-only assertions. A mock of the integrated seam is never the
  only proof.
- Slices that drop or narrow schema on retained data put deploy order in the
  criteria: pre-deploy cleanup lands before the schema change when the platform
  validates existing rows, bulk migrations use a resumable batched runner
  rather than one transaction, and the criteria name the production deploy
  status that proves it landed. A green preview does not.

Agent suitability decides readiness labels, not slice boundaries. Never carve
tests, docs, or a small refactor out of an outcome to make an agent-fit ticket.
Route high-risk or ambiguous work to human planning when the plan does not
settle the security, product, data, or architecture decision.

When any required field, required estimate, or scope boundary is unknowable
from the plan, add the heading, apply `needs-info` (or `ready-for-human` for an
unknowable required estimate) with the exact question, and do not mark the
ticket ready. Never fabricate content to make a ticket look
ready.

## Labels, Estimates, And Readiness

For each `kind-slice`:

- apply one type and one risk label, plus routing and area labels, from config
- estimate after consolidation per the Estimate Rules, only in the configured
  field and scale and only when policy grants To Issues that authority; omit
  estimates when config defines none
- apply the worker environment label only when its approval criteria are met;
  dependency state never withholds it
- apply `ready-for-agent` only when the slice fits one PR, survives the merge
  test, is routed, typed, risk-labeled, estimated if required, has concrete
  scope boundaries, is complete enough to verify, and its body does not say
  human setup, credentials, provider decisions, or security judgment remain
- place ready slices in the configured ready state, usually `Todo`, even when
  blocked; never park them in Linear `Backlog`
- otherwise apply `needs-info` or `ready-for-human` with the exact gap

`ready-for-agent` means no further human refinement is needed; it does not mean
unblocked or startable. Encode blockers separately; they never remove `ready-for-agent`, the ready
state, or a worker environment label.

## Dependency Graph

Emit a graph so the orchestrator can compute the ready frontier and run safe
work in parallel.

- Use tracker relationship or blocker fields when supported, otherwise the
  configured body shape, in the configured direction. By default, if A needs B
  first, A is blocked by B.
- Order slices so each depends only on earlier ones; break and report cycles.
- Serialize slices that must not run concurrently even without a data
  dependency, such as shared schema or migration ordering.
- When surviving slices converge on the same core files or regenerate the same
  shared artifact, land the convergent slice first or immediately adjacent to
  its siblings,
  or serialize the cohort. Same-base siblings all conflict once one merges.

## File Footprint

Record each slice's predicted footprint in the configured location and shape so
the orchestrator can avoid concurrent collisions. It is a prediction; workers
may diverge.

- Unless config names another shape, write them under `## Likely files,
packages, or artifacts`, one backticked path per bullet.
- List likely files, directories, or packages, including shared document
  surfaces such as dense markdown lists, status ledgers, registries,
  changelogs, config tables, and docs sections many slices edit.
- Treat heavy overlap between two slices as a merge candidate first; flag them
  for serializing or sequencing only when a split reason keeps them apart.
- After assigning footprints, compare siblings and record hot files or packages
  and safe fan-out pairs so collisions surface before workers are in flight.

## Coverage Matrix

For a spec, PRD, or container linking one, emit a coverage matrix so dropped
requirements surface at slicing time, not as drift after merge.

- Rows are the spec's section anchors, the same ones slices cite; no separate
  numbering. A section is a row, not a slice boundary, and one slice usually
  covers several.
- Map each requirement-bearing section to exactly one of: implementing slice
  IDs, `deferred` with reason and owning ticket, or an open `needs-info`
  question. Mark sections without requirements `not-applicable`; an absent
  anchor is an uncovered gap.
- Record it on the container body or the configured location. Re-runs update
  the one matrix in place.
- The run is incomplete while any requirement-bearing section is unmapped.
  Report those gaps and do not mark the container's slices ready until every
  requirement-bearing section is mapped.

## Self-Healing

Repair stale or inconsistent structure from current evidence, escalate missing
intent or authority, never leave a silent dead end, and record every fix. Heal
wrong or duplicate `kind-*` values, stale labels that resolve to a verified
one, re-run duplicates, and over-split cohorts. Escalate unknowable scope or
acceptance criteria with `needs-info`.

## Guardrails

- Do not duplicate tickets, ship or ready a container, or invent scope,
  acceptance criteria, or product decisions.
- Do not ticket unrequired work or a layer, step, or fragment of another slice.
- Do not create label taxonomies or statuses without config or explicit user
  approval.
- Keep ticket text metadata-only: no secrets, customer data, signed URLs,
  credentials, or private logs.

## Done

Report:

- source plan and target location
- slices created, adopted, and merged, duplicates converged, slice count, and
  each slice's split reason
- kinds set and contradictions healed
- estimates set, preserved, omitted by policy, or left with exact questions
- tickets marked `ready-for-agent`, `needs-info`, or `ready-for-human`
- dependency graph, cycles, and required serializations
- footprints recorded and overlaps flagged
- coverage matrix location, rows mapped, and uncovered or deferred sections
- heals applied, gaps escalated with exact questions, and what the user must
  answer before the remaining slices can become ready
