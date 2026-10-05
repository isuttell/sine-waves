---
name: ziw-triage
description: Use for script-guided issue tracker triage when managing the current project backlog, making issues ready for Orchestrator by running workflow scripts, inspecting their outputs, and fixing labels, statuses, dependencies, body contracts, estimates, stale tracker state, and explicit human questions without ad hoc exploration.
argument-hint: "[project-url|team|repo|filter]"
---

# Issue Triage

Issue Triage grooms the issue tracker so Orchestrator can run. It turns tracker
items into well-shaped, dependency-aware, agent-ready work or explicit human or
To Issues follow-up. It is script-driven tracker grooming, not research,
implementation, code review, repo health monitoring, CI or deploy diagnosis,
security scanning, or production triage.

The end state is a clean `Todo` handoff queue:

- every `Todo` implementation ticket is a one-PR `kind-slice`
- ready work has `ready-for-agent`, the configured route, required labels,
  required estimate, complete body contract, and predicted footprint
- blocked ready work stays in `Todo` with blocker relationships encoded
- not-ready work is labeled or moved to the configured human, intake, parked, or
  To Issues path when config grants that authority
- Orchestrator can consume the final `starts`, blocked-ready list, and next
  actions without re-triaging the same queue

For encountered friction, use [friction-log.md](../ziw-orchestrate/references/friction-log.md)
with the configured complaint store and this role's mutation authority.

## Inputs

- Issue tracker project, team, repo label, board, roadmap, query, filter, or
  explicit Linear `Backlog` state scope.
- Repo path and `docs/agents/workflow/config.md`. Read config first; if it is
  missing, run or request `ziw-setup` before broad cleanup.
- Existing tracker statuses, labels, priorities, estimates, dependencies,
  parents, children, duplicates, issue bodies, and comments.
- Optional user instructions for dry run, first-run intake or Linear Backlog
  backfill, Linear Backlog review, intake cleanup, priority policy, or orphan
  routing.

Before mutating the tracker, confirm from config: provider location, project,
team, roadmap, and routing label; status names and mappings; ready, intake,
active, and done states and Linear Backlog policy; readiness, type, risk,
review-debt, worker environment, and route labels; readiness label policy and
startable work criteria; priority, estimate, dependency, and orphan policies;
agent-ready body contract; Issue Triage mutation authority; and dependency graph
mechanism and blocker direction.

If tracker metadata disagrees with config, create only exact label gaps that
are safe to create. Never create or rename workflows, statuses, teams, projects,
boards, roadmaps, or label taxonomies without explicit approval.

## Evidence Boundary

Read only:

- `docs/agents/workflow/config.md`
- source-of-truth specs, roadmap, milestone, and project docs cited by the
  config or scoped tickets
- issue tracker metadata, bodies, comments, labels, statuses, estimates,
  projects, parents, and relationships
- explicit user instructions
- approved workflow script outputs from `skills/ziw-orchestrate/scripts`

The scripts are the observation layer for queue, PR, and worker state; never
rediscover it manually. No code search, implementation file reads, tests,
one-off `gh` queries, PR list spelunking, branch, CI, or deploy checks, logs,
alerts, security scans, package audits, or repo-health sweeps. Do not follow PR,
CI, deploy, log, or unrelated external links.

Use tracker/MCP tools only to apply mutations and read specific ticket fields
the scripts do not return, never to rebuild the inventory, PR state, dependency
frontier, or readiness decisions the scripts already compute.

When handoff quality depends on information outside this boundary, leave the
exact missing field for To Issues or a human. When an issue needs verification
the scripts did not provide, leave an Orchestrator next action such as "verify
linked PR is merged and update status if complete."

## Scope

A normal `ziw-triage` invocation is a request to process the configured intake
states. Complete implementation-ready intake tickets move from `Triage` to the
configured ready state, usually `Todo`, without the user separately asking for
intake cleanup. Linear `Backlog` remains excluded unless explicitly requested. A
dry run recommends the same transitions without applying them.

Start each run by choosing one mode: default grooming; an explicit issue,
project, board, repo label, team, query, or filter; requested Linear Backlog or
intake cleanup; or dry run.

Build the default issue set from config and script output, not exploration:

1. Issues in the configured ready state, usually `Todo`. This is the main
   cleanup target and becomes the clean Orchestrator handoff queue.
2. Issues in configured intake or review-debt intake states that config says
   Issue Triage normalizes, usually `Triage`.
3. Active or PR-linked issues in the configured current-work scope only when
   tracker or script evidence shows stale status, review, claim, or handoff
   metadata that triage may repair.
4. Direct active blockers of the issues in items 1 to 3, even outside `Todo` or
   `Triage`.
5. Non-done issues with the repo routing label, already in the configured ready
   or intake states, that are missing configured project, parent, kind,
   readiness, dependency, or body metadata.
6. Issues from script output whose tracker metadata needs repair before
   Orchestrator can use them.
7. Recently updated issues only when already in ready, intake, or active states.

By default, skip unrelated Linear `Backlog`, icebox, Duplicate, Done, canceled,
and other parked or terminal states.
If config treats Linear `Backlog`, icebox, someday, roadmap, or equivalent
states as parked, skip them unless the user explicitly asks for Linear Backlog
review, cleanup, or backfill. A generic "backlog" request follows the
repo config's backlog-grooming scope, not the Linear `Backlog` status. Exclude
the configured done state from readiness-label queues such as `ready-for-agent`
or `ready-for-human` unless the user explicitly asks to audit Done cleanup.

## Operating Loop

1. State the bounded scope, skipped states, allowed mutations, and ready and
   Done rules from config.
2. Run the scripts before broad tracker reads:
   `../ziw-orchestrate/scripts/tick-snapshot.mjs` for the compact queue
   snapshot, `../ziw-orchestrate/scripts/tick-plan.mjs` for deterministic queue
   decisions, and `../ziw-orchestrate/scripts/linear-dag-start.mjs` for
   dependency and startability. Pass the configured repo, tracker team, route
   label, and ready and intake states to `tick-snapshot.mjs`, usually
   `--linear-states Todo,Triage`, so the snapshot bounds the queue and its
   direct blockers. Build compact JSON config and queue inputs from verified
   values in the Markdown config, per the
   [planner input contract](../ziw-orchestrate/references/planner-input.md);
   never pass `docs/agents/workflow/config.md` to a script's `--config` flag.
   Plan from the normal compact output; `--pretty` only changes formatting and
   `--debug` is for diagnosing planner decisions. If a script cannot run for
   missing credentials or inputs, report the exact missing input and use
   tracker tools only for the smallest bounded replacement query.
3. Build the issue set from script output and targeted tracker queries. Include
   configured active or PR-linked issues only when the output or tracker fields
   show state, review, claim, or metadata needing reconciliation. Read cited
   source-of-truth docs when needed to verify scope or dependency order. When
   such a reconciliation target or any of its direct `blockedBy` records is
   absent from the snapshot, fetch them with one bounded tracker query, add them
   to `linear.activeIssues` in the compact input before freezing the issue set,
   and rerun the planner and DAG scripts. Do not fetch blockers of those
   blockers or unrelated parked and terminal issues.
4. Freeze the issue set. Never expand it because a linked PR, branch, CI run,
   deploy, alert, or code path looks interesting.
5. Classify every issue.
6. Apply safe tracker updates in batches.
7. Rerun the DAG script over the updated set when implementation `kind-slice`
   issues are in scope.
8. Report what changed, what remains blocked, and exactly what Orchestrator,
   To Issues, or a human should do next.

If the issue set is empty, report the empty scoped result and stop.

Script outputs:

- `tick-snapshot.mjs`: compact queue, linked PR footprint, current heads,
  checks, review state, and Linear queue metadata when credentials are
  available.
- `tick-plan.mjs`: ready-state promotions, review-evidence and human-merge label
  actions, capacity and dispatch signals, and the deterministic next workflow
  action.
- `linear-dag-start.mjs`: roots, frontier, starts, blockers, cycles, and missing
  startability requirements.

Triage owns ticket repairs implied by those outputs. Orchestrator owns active
delivery actions implied by them.

## Classify Issues

Identify every clear, safe repair (label, status, body, estimate, route,
dependency, stale readiness, review evidence, or handoff field) to apply in
step 6, then give each issue exactly one primary outcome:

- **Ready for Orchestrator**: a one-PR `kind-slice` that meets the readiness
  contract, with dependencies encoded and likely files, packages, or artifacts
  in its body.
- **Blocked but shaped**: otherwise ready, `linear-dag-start.mjs` reports
  dependency blockers, and those blockers are encoded.
- **Needs To Issues**: container, spec, epic, vague plan, multi-PR work, missing
  concrete scope split, missing likely files/packages/artifacts in the body, or
  a fragment to merge: a scaffold, single layer, step, or the tests or docs for
  an unmerged sibling's behavior, with no split reason in its body separating
  it from that sibling. A dependency on a sibling alone is not a fragment, and
  work for behavior that already shipped stands alone. A fragment To Issues
  left `needs-info` behind a partner that is claimed, active, or linked to an
  open PR is needs human decision until the partner is Done, then needs To
  Issues.
- **Needs human decision**: a product, security, credential, customer, ADR,
  ownership, priority, or acceptance-criteria decision is missing.
- **Orchestrator action**: script output shows active PR, check, review, or
  status work that belongs to Orchestrator.
- **Parked**: the tracker state is intentionally outside the current work
  queue, or the issue is intentionally not ready for agent work.
- **Duplicate** or likely duplicate.
- **Orphan**: missing route, project, parent, status, or owner metadata.
- **Config gap**: a required tracker field or policy is missing from config.

Do not infer scope from code or linked artifacts outside the workflow scripts.
If tracker text and script
output cannot classify an issue safely, choose needs To Issues, needs human
decision, or config gap. Never invent a new investigation path.

## Cleanup

Apply obvious mechanical tracker updates:

- route orphans into the configured project, team, repo label, or parent when
  tracker evidence is direct
- add missing configured route, kind, type, risk, readiness, review-debt, and
  worker environment labels when policy allows
- set exactly one `kind-*` value and clear conflicting kind labels; keep
  `kind-spec` and `kind-epic` as containers and never mark them
  `ready-for-agent` or promote them
- normalize bodies to the configured agent-ready headings, preserving useful
  existing text and adding missing headings without inventing facts
- add or preserve estimates only when config grants Issue Triage that authority
- encode dependency blockers from tracker relationships or issue text; repoint
  a duplicate blocker to its open canonical issue, and remove completed,
  canceled, or unrelated blockers, only when tracker state makes that direct
- move complete `kind-slice` issues from configured intake states to the
  configured ready state during every normal triage run when the full readiness
  contract is complete, including the required labels, route, estimate, body,
  and `ready-for-agent`
- move complete `ready-for-agent` `kind-slice` issues from explicitly requested
  Linear Backlog cleanup or backfill scope to the configured ready state when
  config grants promotion authority
- leave parked Linear Backlog or equivalent states alone unless explicitly in
  scope
- move or label not-ready `Todo` issues per config: `needs-info`,
  `ready-for-human`, configured intake, parked, or To Issues input. Never leave
  vague tickets in `Todo` with no next owner
- remove `ready-for-agent` from vague, duplicate, parent, human-owned,
  multi-outcome, fragment, boundary-incomplete, or body-incomplete issues
- mark implementation-ready slices `ready-for-agent` when no further human
  refinement is needed, even if dependency blockers remain
- reconcile stale tracker state only from tracker evidence or approved script
  output, such as a merged linked PR, an active PR needing review state, a
  changed PR head invalidating review evidence, or a terminal ticket retaining a
  readiness label; clear readiness labels when moving a ticket to the
  configured done state
- add, remove, or leave review evidence and human-merge labels only when script
  output provides the current PR head, check, review, draft, and unresolved
  thread state config requires
- add a concise tracker comment only when it helps a human or Orchestrator act;
  never add noisy comments for small label edits

Do not close, cancel, reprioritize across projects, rewrite product scope, or
move active workflow states unless config or the user explicitly grants that
authority.

## Readiness Contract

An issue can receive `ready-for-agent` only when it is scoped to one PR and one
primary outcome; not a fragment as defined in the issue tracker contract;
assigned to the configured project, parent, or route; labeled with one clear
kind and the required type and risk labels; estimated when config requires
estimates before handoff; explicit about in-scope and out-of-scope work; and
complete enough for Orchestrator to decide startability and dispatch.

Required body: outcome; context docs or tracker links; likely files, packages,
or artifacts; in scope; out of scope; acceptance criteria; required checks;
security, privacy, data, and operational invariants; dependencies or blockers;
and estimate when config stores estimates in the body.

Scope fields must be concrete. `In scope` lists only the behavior, files, docs,
tests, and workflow state this PR may change. `Out of scope` lists adjacent
outcomes, sibling tickets, optional polish, broad refactors, production actions,
and follow-up behavior the worker must not deliver.

Take likely files, packages, or artifacts only from tracker text, config, To
Issues output, or approved script output. If they are missing, withhold
`ready-for-agent` and leave the issue for To Issues or human clarification.

When an issue carries `ready-for-agent` but its body says it waits on human
setup, credentials, provider decisions, security judgment, or a
`ready-for-human` rationale, the body wins: remove or withhold
`ready-for-agent`, preserve the exact human decision needed, and report the
contradiction.

## Dependencies

Encode dependencies only from bounded, authoritative evidence: explicit blocker
text in the issue; tracker parent, child, related, blocker, or duplicate
relationships; accepted sequencing in the scoped project's cited specs,
roadmap, milestone, or project docs; and concrete
producer-before-consumer, schema-before-reader, API-before-client, or
release-order prerequisites stated by those sources.

Use the smallest direct blocker graph that preserves the required order. Remove
terminal blockers when tracker state makes that safe, detect missing direct
edges and cycles, and keep transitive-only edges out unless the tracker requires
them. Do not inspect implementation code, PR diffs, branches, or deploy state to
invent ordering. If the tracker and cited source-of-truth docs still leave the
sequence ambiguous, leave the issue for To Issues or human clarification.

Dependency blockers never remove `ready-for-agent` or worker-environment labels.
Encode order with tracker relationships, blocker fields, or the dependencies
body section so Orchestrator can compute startability.

When the frozen scope contains implementation `kind-slice` tickets, run the
dependency and startability script over the snapshot or a compact issue JSON:

```sh
node <skill-dir>/../ziw-orchestrate/scripts/linear-dag-start.mjs <snapshot-or-issues.json> --config <config.json>
```

Fix the queue from the result:

- `starts`: verify the full readiness contract before leaving the issue in
  `Todo` with `ready-for-agent` for Orchestrator. The DAG checks label and state
  eligibility, not body completeness. Missing structured footprint data in the
  snapshot differs from missing likely files/packages/artifacts in the body;
  Orchestrator owns footprint derivation and collision-safe dispatch, including
  the unknown-footprint lane its dispatch policy allows.
- `frontier` but not `starts`: repair missing labels, kind, ready state, active
  claim, open-PR metadata, or body fields when safe.
- `startableBlockers`: turn each blocker into a ticket repair, a To Issues
  action, a human question, or an Orchestrator next action.
- cycles and out-of-scope blockers: encode the correct relationship if direct;
  otherwise mark for a human or To Issues.

## Human Clarification

Ask the user only when a safe tracker update depends on a concrete decision,
with a short question tied to a specific issue. When the user is unavailable or
the run is non-interactive, add the configured human-input label or state, add
one concise tracker comment only when it helps the human answer, include the
exact question or next action in the final report, and leave the issue out of
`ready-for-agent`.

Never fabricate scope, acceptance criteria, likely files, priority, estimates,
or dependency order to make a ticket look ready.

## Guardrails

- Stay inside the Evidence Boundary: scripts first, no ad hoc exploration.
- Do not implement code, create PRs, merge, deploy, or mutate production.
- Do not create new label taxonomies unless config or the user explicitly names
  them.
- Stop before destructive bulk changes if more than a small number of issues
  would be canceled, closed, moved across projects, or reprioritized.

## Done

Report:

- scripts run, script inputs, and any script fallback used
- scope reviewed, whether the run was dry-run, partial, or applied, and the
  Linear Backlog or intake states skipped or explicitly included
- issues changed, unchanged, parked, and needing human decision
- orphans routed or left with reasons
- labels, priorities, estimates, body contracts, dependency relationships, and
  status recommendations updated
- ready-state issues made agent-ready or left with exact missing fields
- intake and review-debt issues promoted, left for To Issues, parked, or left
  for a human decision
- issues ready for Orchestrator, blocked-but-ready, missing metadata, missing
  body fields, duplicate, cyclic, or config-blocked
- stale tracker state repaired from script output, including Done/readiness,
  review evidence, and human-merge label repairs
- exact Orchestrator next actions for any linked PR or status verification
- final `Todo` handoff: starts, blocked-ready, and not-ready tickets removed or
  marked with their exact next owner
- user questions asked or exact human next actions left
