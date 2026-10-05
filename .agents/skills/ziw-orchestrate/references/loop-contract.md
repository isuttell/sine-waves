# Loop Contract

How Agent Orchestrator runs as a recurring loop without growing its context.
Agent Orchestrator is the only active work loop. This file defines how each
wake-up behaves so a long-running loop stays as light as a first run.

## Self-Scheduling

The loop must drive itself. Do not require a human to re-trigger each pass.

Use whatever recurring mechanism the runtime already has:

- Claude Code: a scheduled run, a `/loop`, or a wake-up timer between ticks.
- Codex: a scheduled task or automation.
- Any runtime: its native cron, timer, or repeat primitive.

Pick the most appropriate built-in. Never invent a manual entry point or ask the
user to kick each tick. If the runtime has no recurring primitive, run one pass
and report the exact command the user should schedule.

## One Tick

A tick is a single, stateless-against-external-state pass. The loop's goal is to
clear its scope as fast as the safety gates allow. Within a tick, take every
safe action currently available: advance PRs and repairs while filling every
worker slot with the full non-colliding startable set. A tick exits when
no safe action remains right now, not after one action per ticket. Rationing
work across future ticks (one dispatch per wake-up, one action per ticket) is a
throughput bug; leaving safe actions undone at tick exit for any reason other
than the cap, a collision hold, or an exhausted budget is a friction event.

What a tick must not do is loop in-context _waiting_: once every currently
available action is taken and the remaining work is waiting on workers, checks,
reviews, or providers, exit and let the next tick pick up the new signal.
Waiting is what the schedule is for; context growth, not action count, is the
thing being bounded.

Each tick should use model judgment over refreshed evidence to choose the next
safe action. The loop is intentionally light on context, not light on reasoning:
load or delegate the evidence needed to decide, then act, delegate, repair,
nudge, or escalate. The examples in this contract bound context and cadence, not
the orchestrator's authority to choose an unlisted safe workflow action.

For a verified-ready delivery scope, every tick should assume the scoped tickets
are intended to move through implementation, PR, review, and merge unless current
evidence proves a real blocker. The Linear `Backlog` state is different: it is
not dispatchable until triage promotes correct, committed tickets into the ready
state. Routine label/status drift is repaired as part of the tick instead of
becoming a human escalation.

Each tick:

1. Wake light. Load only repo config, scope, the dispatch ledger, and the review
   checkpoint. Refresh local Git refs, HEAD, worktree list, and
   `git status --short --branch` when a local checkout is in play. Do not carry
   diffs, logs, or issue histories across ticks.
2. Rebuild the queue from systems of record. When the synced skill directory
   includes `scripts/tick-snapshot.mjs`, run
   `node <skill-dir>/scripts/tick-snapshot.mjs --repo <org/repo>` first: one
   call returns baseline health, the open-PR footprint, per-PR head SHAs,
   mergeable state, unresolved review-thread counts, check rollups, and
   review verdicts as JSON. Reason over that snapshot instead of assembling
   the same state from many tool calls; it needs an authenticated `gh`, and
   with `--linear-team <KEY|UUID|NAME>` plus either a `linear-graphql.mjs setup` credential
   or `LINEAR_API_KEY`, it also returns the open issue queue with unresolved
   `blockedBy` identifiers per issue. Then run
   `node <skill-dir>/scripts/tick-plan.mjs <snapshot.json> --config <config.json> --state <queue-state.json>`
   when compact queue/config JSON is available. Follow
   [planner-input.md](planner-input.md) when assembling it; fix validation
   errors at their reported field paths before acting. The planner deterministically
   returns compact actions, including review-evidence and human-merge PR label
   updates, waits, holds, capacity, and wake state. Use `--debug` for the full
   decision evidence, including Linear DAG roots/frontier. Use
   `node <skill-dir>/scripts/linear-dag-start.mjs <snapshot.json> --config <config.json>`
   when only the Linear dependency frontier is needed. An empty DAG succeeds
   with no starts; it does not prove that the requested scope is complete.
   Verify an unexpectedly empty queue directly with tracker tooling or a fresh
   snapshot before treating the scope as done. Missing tracker evidence in the
   compact plan is `TRACKER_STATE_MISSING`, not a drained queue. Never dispatch an issue
   whose snapshot or tracker state shows an incomplete blocker. Use tracker
   tooling for issue bodies and comments. Delegate the inventory read to an
   isolated triage worker when the runtime has one; keep only the compact queue
   (ID, state, readiness, blockers, PR, owner, next action) in the main context.
3. Reconcile the ledger against refreshed tracker, PR, and local-worktree state.
   Synthesize missing dispatches from repo-scoped active tracker claims and
   dirty, baseline-unmerged, or uncertain non-default worktrees. Deduplicate by
   issue, branch, head, or worktree; drop stale ledger entries; re-dispatch or
   escalate stuck workers. A failed worktree inventory is a snapshot failure,
   not evidence of zero local workers.
4. Refresh worker capacity from confirmed implementation and repair sessions.
   Do not count human assignees, open PRs, previews, or abandoned worktrees as
   workers. Keep those signals in the action and collision inventory.
5. Act on everything actionable this tick and refill worker slots immediately:
   advance returned PRs, previews, and stuck drafts while dispatching unrelated
   safe work. Merge green PRs, route fixes, run
   `gh pr update-branch <pr>` on GitHub PRs after main moves, inspect previews,
   and dispatch unrelated new work concurrently. Do not delegate routine branch
   updates; delegate only after the update reports a merge conflict or
   equivalent manual conflict state. Fill all worker headroom in the same tick
   with the full non-colliding startable set; do not save startable
   tickets for a later wake-up. Before fanning out, compare predicted file
   footprints against active PRs, active branches, and selected candidates;
   hold concrete collisions; derive unknown footprints in the same tick unless
   one unknown-footprint lane can safely start with nothing to collide against
   instead of spending spare slots. Draft state is an orchestration repair
   signal, not a code review request, and capacity pressure is not a reason to
   close a draft or in-progress PR.
6. For every selected ticket, apply the dispatch action's `targetState` and
   require the tracker to confirm the configured in-progress state before
   launching an isolated worker. If that transition fails, do not start the
   worker. Delegate every context-heavy step (implement, review, triage) only
   after its claim succeeds. Reduce each worker result into the compact queue
   and ledger before continuing.
7. Persist only the ledger and checkpoint. Append friction entries. If the queue
   is completely blocked, report blocked and stop the recurring run for this
   scope. A preferred remote worker having no eligible tickets is not complete
   blockage. Account for authorized local work, PR actions, tracker repair, and
   expected external signal first. Otherwise exit.
8. Sleep until the next scheduled tick only when future external signal can still
   arrive without user intervention.

Refresh local Git state again before any action that depends on current branches,
PR heads, default-branch drift, worktrees, or file contention. Local Git is not
the authority, but stale local observations must not drive orchestration.
Refresh it again after any code-host or tracker mutation that changes PR,
review, merge, or done state before choosing the next action.

Automation checkpoints are hints, not authority. If a checkpoint disagrees with
the refreshed tracker, code-host, baseline, worker, or CI state, discard its
claims for the tick. Failure to update the checkpoint must not reintroduce stale
capacity or PR framing on the next wake-up.

## Light Context Budget

The token sink is not this skill; it is re-reading heavy artifacts every tick.
Keep these out of the main context and behind isolated workers:

- full issue descriptions and comment histories
- diffs, patches, and file contents
- full PR reviews and check logs
- test output

Keep only metadata: IDs, states, labels, SHAs, URLs, counts, and the next
action per ticket.

## Tick Cadence

- Choose a cadence that matches how fast external state changes, not a fixed
  short interval. Polling faster than workers produce signal wastes ticks.
- Adapt the interval to what the last tick found. After a tick that dispatched
  workers or expects fast signal (checks running, reviews in flight), schedule
  the next tick at the base interval, matched to how quickly that signal
  actually lands. After a transient tick that found nothing actionable, back
  off: roughly double the interval each consecutive quiet tick up to a
  configured or sensible maximum. Any new signal or action taken resets the
  interval to base. When the runtime supports choosing the next wake-up delay
  per tick, set it explicitly each tick instead of keeping a fixed schedule.
- A transient tick with no safe action is normal when workers, checks, reviews,
  or providers are still expected to produce signal. Record a heartbeat, back
  off the interval, and sleep.
- Before rerunning a preview or hosted check, inspect the workflow state. A job
  that is still progressing is wait evidence, not failure evidence.
- A completely blocked queue is not a transient tick. Stop the schedule, not just
  the tick, when every scoped item is terminal or waiting on a blocker the
  orchestrator cannot safely clear.
- Also stop the schedule when any hard stop condition in the skill is met
  (tooling unavailable, budget exhausted, thrash breaker tripped).

## Cross-Tick State

The tracker and code host are the source of truth. The ledger and checkpoint are
the only things a tick may carry forward, and both are non-authoritative caches
reconciled against external state on the next tick. A tick must work correctly
even when the ledger is empty (fresh process, new environment).
