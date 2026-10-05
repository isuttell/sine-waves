# Issue Tracker Contract

Use this when writing the issue tracker section of
`docs/agents/workflow/config.md`. The configured tracker can be any provider the
repo uses.

## Default States

- `Triage`
- `Backlog`
- `Todo`
- `In Progress`
- `Blocked`
- `In Review`
- `Changes Requested`
- `Ready to Merge`
- `Done`
- `Canceled`
- `Duplicate`

## Default Labels

Kind (single-select; skills enforce exclusivity even if the tracker group does
not):

- `kind-spec`: holds spec or PRD prose; input to To Issues; never dispatched
- `kind-epic`: parent or workstream container; never dispatched
- `kind-slice`: one-PR implementation ticket; the only kind a worker runs

Kind is a separate axis from type. A `kind-slice` still carries one type label.
`ziw-to-issues` sets exactly one kind and clears any other `kind-*`.

Readiness:

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

Risk:

- `risk-normal`
- `risk-security-sensitive`
- `risk-schema`
- `risk-cross-cutting`

Review evidence:

- configured exact label slug or ID, such as `code-review-passed`

Type:

- `Bug`
- `Feature`
- `Improvement`
- `Tech Debt`
- `Spike`
- `Hotfix`

## Agent-Ready Issue Body

An issue is ready for Agent Implement only when it is scoped to one PR and
contains:

- outcome
- context docs, with spec citations when the work comes from a spec
- likely files, packages, or artifacts, under a heading of that name with one
  backticked path per bullet so Orchestrator can parse the footprint
- in scope
- out of scope
- acceptance criteria
- required checks
- security, privacy, data, or operational invariants
- dependencies or blockers
- estimate when repo config stores estimates in the body

The issue body must make the slice boundary explicit. `In scope` names only the
behavior, files, docs, tests, and workflow state this PR may change.
`Out of scope` names adjacent outcomes, sibling tickets, broad refactors,
optional polish, production actions, and follow-up behavior the worker must not
deliver. A ticket with vague or empty boundaries is not ready for agent handoff.

Spec citations are the traceability unit between specs and slices. When a slice
implements behavior defined in a repo spec, PRD, or ADR, the context docs
section must cite the exact sections it implements as resolvable links, such as
`docs/specs/<file>.md#<section-anchor>`. Acceptance criteria for cited behavior
must be traceable to those sections. A spec-derived ticket whose citations are
missing or do not resolve is not ready for agent handoff. Workers and reviewers
read the cited sections, not the whole spec corpus.

If the work requires multiple PRs, keep it as a container or split it into
multiple `kind-slice` issues. Do not mark a multi-PR scope as a ready slice.

Do not mark a fragment as a ready slice either. A slice is a whole outcome with
its code, tests, docs, config, and migration. A fragment has no consumer or
observable behavior of its own in its PR, such as a scaffold, a single layer, a
verification step, or the tests or docs for an unmerged sibling's behavior. It
is not a fragment when its body records a split reason separating it from the
sibling it serves, when it depends on a sibling but has its own behavior, or
when the behavior it covers already shipped. Blocked slices stay ready. Route a
fragment to To Issues as a merge candidate. While To Issues has left it
`needs-info` behind a partner that is claimed, active, or linked to an open PR,
it waits on the human answer instead; once the partner is Done, route it back
to To Issues to close as covered or reshape. Only `ziw-to-issues` folds
tickets, and it owns the split reasons and merge test.

## Estimate Rules

Repo config decides whether estimates exist and where they live. A repo may use
a tracker estimate field, estimate labels, a body heading, or no estimates.

- Do not create or infer estimates when config has no estimate field, scale, and
  policy.
- When config grants agents authority to estimate, To Issues and Issue Triage
  include estimates on `kind-slice` tickets using the configured field, label, or
  body heading.
- Missing estimates block `ready-for-agent` only when config says estimates are
  required for ready handoff. Otherwise leave the estimate empty and do not use
  it as a readiness blocker.
- Use only the configured scale. If a slice exceeds the configured maximum, split
  it or route it to human planning instead of inventing a larger value.
- Preserve existing human estimates unless config explicitly allows repair and
  current scope evidence proves the estimate is stale or outside the allowed
  scale.
- Treat estimates as implementation effort or size, not priority, risk,
  deadline, or merge authority.

## Label Treatment Rules

- Repo config owns the treatment policy for every readiness and worker
  environment label. The defaults below apply only when the repo has no
  different verified mapping.
- `ready-for-agent` means no further human refinement is needed before handing
  the issue to an implementation agent. The issue should be scoped to one PR and
  backed by a complete agent-ready body with concrete in-scope and out-of-scope
  boundaries. It can be present while dependency blockers remain.
- A ready `kind-slice` should be in the configured ready state, usually `Todo`,
  even when it is blocked by another ticket. Linear `Backlog` is out of the agent
  work queue, not a dependency holding area. It means the user does not want
  agents working the ticket yet because the work is uncommitted, intentionally
  parked, or not shaped correctly.
- `ready-for-agent` must be removed when an issue moves to the configured `Done`
  state. Done work is complete, not waiting for agent handoff.
- Only the To Issues intake pass, or a triage pass applying the same body
  contract, may set `ready-for-agent`. Flows that file tickets without intake
  must leave readiness labels off so the gap stays visible.
- Queries for `ready-for-agent`, `ready-for-human`, or equivalent readiness
  attention labels must also exclude the configured `Done` state by default.
  Stale labels on Done tickets are cleanup drift, not current work queue input.
- Issue Triage should make current tickets agent-ready and keep tracker state
  aligned with external reality. Its default scope is the configured ready state,
  usually `Todo`, configured intake such as `Triage`, plus active or PR-linked
  issues that need repair. It should
  not review Linear `Backlog` or equivalent out-of-work-queue states unless the
  user explicitly asks for Linear Backlog review.
- During every normal triage run, Issue Triage may move complete issues from
  configured intake states such as `Triage` to the configured ready state,
  usually `Todo`. Encode blockers separately; dependency blockers do not prevent
  ready-state promotion. Do not promote Linear `Backlog` by default, but do
  promote complete scoped Linear Backlog issues when the user explicitly asked
  for Linear Backlog review or backfill. Generic intake cleanup does not include
  Linear Backlog promotion.
- Startable implementation work is `Todo`, unblocked, labeled `ready-for-agent`,
  and has a complete agent-ready body with explicit non-goals.
- Issue-assigned agent work, when supported by the repo, uses the repo-configured
  worker environment label, routing field, or metadata the tracker integration
  needs to select the environment.
- Issue-assigned delegation also requires the configured repo-route label (such
  as `<org>/<repo>`) so the assigned agent can resolve which repository to clone.
  Treat a missing repo-route label as a hard block on delegation: heal it inline
  when the tracker team maps unambiguously to one repo, otherwise escalate
  `needs-info`.
- When the user explicitly chooses an issue-assigned worker path, Orchestrator or
  Issue Triage may add the configured worker environment label or field after
  verifying the issue identity, repo route, and environment approval criteria. Do
  not require dependencies to be clear just to apply the environment label.
- If a repo uses an extra label such as `remote-worker` or `remote-cursor`,
  record it in `docs/agents/workflow/config.md`; it is not a shared default.
- Labels are coordination signals. The issue tracker is the source of truth for
  workflow state. Issue Triage owns configured intake-to-ready promotion and verified
  stale-state reconciliation, such as marking linked merged PR work `Done`; when
  it marks work `Done`, it also clears `ready-for-agent`. Agent Orchestrator owns
  active workflow state unless the user explicitly says
  otherwise.
- When Linear and GitHub are connected and both linked entities exist, assume the
  ticket and PR state are synced. Linear may advance ticket status from GitHub PR
  status, so agents should refresh both systems before manual state repair.
- When a code-host integration auto-moves an issue to `Done`, Orchestrator or
  triage must verify the full issue scope is complete before leaving it there.
  If linked PR evidence covers only part of the issue, reopen or narrow it
  according to repo config.
- The configured review evidence label means the linked PR's review-relevant
  diff has passed the configured code review gate for this ticket. Resolve it
  by the exact configured slug or ID, not by reconstructing a display name.
  Apply it only with adjacent review evidence that names the PR URL, reviewed
  head SHA, and review-diff fingerprint. Remove it when that diff changes,
  blocking review findings appear, the linked PR changes, or the review evidence
  is missing or stale.
- The configured code-host human-merge PR label means the PR is ready to merge
  except for required human merge authority. Apply it only to open non-draft PRs
  with current clean review evidence, passing required checks, complete or
  policy-skipped hosted review, matching issue scope, and no unresolved blocking
  review thread. Clear it when any of those facts changes.
- Blocked work can keep `ready-for-agent`. Blocker relationships, body blockers,
  or workflow state stop scheduling; they do not redefine readiness metadata.
- Worker environment labels are approval and routing metadata. They do not say
  whether the issue needs human refinement, whether dependencies are done, or
  whether Orchestrator may start it now.
- Human setup, credentials, product judgment, provider approval, customer input,
  and ADR decisions use `ready-for-human` or `needs-info`.
- `ready-for-human` and other human-attention states are truthful claims that
  the only remaining work is the named human action. Unresolved agent-fixable
  review findings keep the ticket with the agent; fix them before escalating.
- Dependency order should be encoded with tracker relationships when the
  provider supports them. By default, if ticket A needs ticket B first, A is
  blocked by B and B blocks A. Use the smallest direct graph that lets
  Orchestrator compute the ready frontier.
- Auth, bootstrap, claim, invitation, one-use grant, custody, or ownership
  tickets need explicit security invariants before they are marked ready:
  authenticated actor binding, tenant or resource scope, replay behavior, atomic
  consume or claim semantics, and concurrency checks.
- Parent or workstream issues are containers unless explicitly marked
  executable. `kind-spec` and `kind-epic` are containers: they are To Issues
  input and must never be dispatched to a worker or marked `ready-for-agent`.
  Only `kind-slice` tickets are startable implementation work.
- Linear Backlog review is opt-in. Do not scan, rewrite, promote, or reprioritize
  Linear Backlog issues during default issue triage. Keeping a ticket in Linear
  Backlog is a valid outcome when the user has not committed to the work or the
  ticket is not correct enough to enter the ready queue.

## Agent Suitability

Use task type and risk to decide whether a `kind-slice` should be delegated to
an implementation agent.

Good default agent work:

- documentation
- tests
- build, CI, and lint updates
- small refactors with clear local checks
- scoped bug fixes with reproduction steps or acceptance checks
- isolated UI changes with screenshots, target states, or exact copy

Default human-planning work:

- auth, authorization, PII, secrets, payments, or destructive data
- production incidents or production deploy decisions
- broad refactors and cross-repo changes
- deep domain behavior without clear acceptance criteria
- performance work without a benchmark
- tasks where learning, design judgment, or product ambiguity is central

External APIs, credentials, production access, or unclear domain behavior should
move a ticket to `needs-info` or `ready-for-human` unless the ticket states the
verification path clearly enough for an implementation worker.

## Tracker Metadata Verification

Setup must record query-safe tracker metadata for the configured scope:

- exact provider IDs, keys, or display names accepted by the tracker tool
- status field names used by the current tool, such as `status`, `state`, or
  `statusType`
- blocker and dependency relationship fields
- routing and readiness labels
- a read-only verification query that returns the expected issue set

Do not treat an empty tracker response as proof that no work exists until the
configured provider ID or query-safe name has been verified. Do not parse local
tool-result cache files when the tracker tool can answer directly.

Do not mutate a real implementation issue to test whether a delegation field,
agent name, or integration exists. Use read-only metadata, existing verified
config, provider docs, or a user-approved test issue.

## Orphan Rules

An orphan is a real issue that belongs in the workflow but is missing the project,
team, parent, route label, status, body contract, or dependency links that let
Agent Orchestrator reason about it.

- Route orphans when the correct project, team, parent, or label is directly
  evidenced by the issue, linked docs, PR, branch, or configured repo route.
- Leave ambiguous orphans in triage with `needs-info` or `ready-for-human`.
- Do not mark an orphan `ready-for-agent` until routing, body contract, and
  labels are correct. Encode blockers separately.
- Do not cancel or close an orphan only because it is stale.

## Creating Tracked Work From Docs

When turning roadmaps, specs, ADRs, or plans into issues:

- extract only explicit capabilities, decisions, constraints, deferred work, and
  dependencies
- create the fewest one-PR implementation slices that ship safely; do not split
  by layer, artifact type, file, step, spec section, or acceptance criterion
- give each slice one primary outcome with its tests and docs, and concrete
  non-goals
- ticket only work the source states; adjacent polish, cleanup, and follow-ups
  the source does not ask for are non-goals, not tickets
- group by the configured tracker location, milestone, and parent or workstream
  issue
- apply repo routing, type, risk, area, and readiness labels from config
- leave vague ideas un-ticketed until scope is clear

Do not invent product scope, create new risk levels or label taxonomies, or
paste secrets, customer data, signed URLs, credentials, or private logs into the
tracker.
