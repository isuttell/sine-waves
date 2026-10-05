# Friction Log

Use this reference only when writing friction intake entries or run rollups.
Friction is retrospective signal for improving skills, setup, or slicing. It is
not authoritative state.

## Sink

Use one complaint store per event. Read the primary writer and explicit
fallback from repo config; verify that the current session exposes the tool.

- `mcp-complaint`: use the configured complaint-writing tool. Include the
  known project, worktree/session, agent, source, what happened, impact, what
  was tried, and an optional suggested fix. Match the provider's schema; put
  the workflow event category in the message when its category field uses a
  different taxonomy. Omit unknown metadata.

- `comments-on-dedicated-ticket`: append one compact comment per entry on the
  configured friction-log ticket. Do not read the whole thread.
- `ticket-per-finding`: create compact tracker tickets in the configured private
  intake location, usually `Inbox` or `Triage`. These tickets must not carry
  `ready-for-agent` or enter the normal delivery queue until triage converts
  them into concrete work.

Prefer the configured MCP complaint store whenever its writer is available.
For MCP-primary configs, tracker modes are fallbacks only when config names them and the
calling role has tracker-write authority. Author QA and read-only reviewers
never create tracker fallback issues. A successful
write ends storage for that event; do not mirror it to notes, files, another MCP
server, or tracker tickets. Report each distinct issue once per task, adding a
new entry only for meaningful new information.

If the writer is unavailable or fails, use only the configured fallback and
record which store accepted the entry. Without a fallback, report the storage
gap once and continue authorized work. Do not repeatedly retry, invent tool
names, or use generic note-writing tools as a complaint API. If a response is
ambiguous, check for an accepted entry through the configured reader before
retrying or using a fallback; if acceptance cannot be checked, report the
uncertainty instead of risking a duplicate.

If config names no friction intake, do not create public or delivery-queue
tickets. Create a missing dedicated ticket only when config authorizes that
private fallback; record its ID during the next setup refresh.

A legacy config that explicitly names a tracker provider, location, and mode
but has no MCP writer or fallback field remains a valid primary until Setup
refreshes it. Use that authorized sink once and report a `config-gap` recommending
the MCP migration. Do not infer a new provider or duplicate historical records.
With no configured intake, report the setup `config-gap` once and store nothing.

## When To Write

All workflow roles record encountered friction, including broken tools,
environment problems, confusing instructions, unnecessary workflow overhead,
and difficulty collaborating with the user. Filing a complaint does not need
additional permission and never authorizes a fix, delivery work, or messaging.
Also write entries at give-up, retry, repair, and stop points:

- escalation
- re-dispatch
- contention deferral
- repeated review bounce
- inline config or tracker metadata heal
- stuck worker
- merge conflict
- post-merge break
- review-created ticket missing required issue shape
- worker PR that could not be verified without a sibling ticket's change

At the end of a bounded run, post one compact rollup with counts by category. Do
not post rollups every tick unless the unattended run config asks for it.

For `ticket-per-finding`, avoid one ticket per tick. Create tickets for
actionable events, repeated patterns, or final run rollups that point to an
upstream skill/config improvement.

## Entry Format

Each entry is one compact, secret-free record. Standalone MCP complaints use
the provider's supported message, category, and attribution fields. Include
what happened, impact, and what was tried in the message if the schema has no
separate fields for them. Omit unknown fields and never invent arguments.

The format below and Category Map apply to orchestrator workflow events in
either sink. Other authorized tracker complaints use the standalone message
facts and known attribution, without inventing a workflow event category. For an MCP event, put these details in its message; the
provider's category field still follows its own schema. Omit tick or ticket
metadata when it does not exist, such as a complaint outside a work loop:

```text
tick: <id or timestamp>
ticket: <ISSUE-ID or "loop">
category: ambiguous-ticket | over-sliced | dependency-wrong | file-collision | stuck-worker | review-thrash | review-debt-intake | merge-conflict | post-merge-break | config-gap | escalation
what: <one line>
cost: <ticks, retries, or wall-clock burned>
signal: <what would have prevented it, and which upstream skill it points at>
```

For orchestrator workflow events, use exactly one Category Map value in the
message. Put distinctions in `what` or `signal`. Standalone tool, instruction,
overhead, or collaboration complaints use the provider's category taxonomy;
do not force them into orchestration categories.

Do not post status notes, dispatch ledgers, success notes, or `cost: 0 /
signal: none` entries. The log records friction only.

## Rollup Format

```text
run: <id or timestamp>
scope: <ticket IDs, query, project, or filter>
started: <count>
merged: <count>
waiting: <count>
blocked: <count>
first-pass-checks: <passed/total or "unknown">
review-rework: <tickets returned for fixes>
friction: <category=count, category=count>
throughput: <whole-run tickets/hour; optional visible-window tickets/hour>
agent-cost: <tokens, credits, or "unknown">
```

Post the run rollup after the final action, not while work is still settling.
A rollup summarizes counts and references stored complaints; it does not copy
each complaint to another store or turn routine success into a complaint. If
the complaint API has no run-metrics capability, report the rollup in the
handoff rather than filing a success-only complaint.

## Category Map

- `ambiguous-ticket`: To Issues or triage needs clearer scope.
- `over-sliced`: To Issues cut a fragment: a ticket with no consumer or
  observable behavior of its own, a worker PR that had nothing verifiable
  without a sibling ticket's change, or a diff that did not justify its own PR.
  A slice with its own behavior that lacked a blocker edge is
  `dependency-wrong`.
- `dependency-wrong`: To Issues or triage dependency modeling was wrong.
- `file-collision`: To Issues footprint prediction or serialization needs work.
- `stuck-worker`: worker liveness or continuation tuning.
- `review-thrash`: slice size, implementation quality, or review routing.
- `review-debt-intake`: Agent Review, To Issues, triage, or setup produced
  malformed follow-up work.
- `merge-conflict`: slicing, base drift, or serialization issue.
- `post-merge-break`: merge or default-branch verification gap.
- `config-gap`: setup/config/tooling facts are missing or stale.
- `escalation`: external owner or authority required.

When an upstream fix for a repeated entry has landed, later occurrences
reference that fix as recurrence evidence instead of re-filing discovery.

The friction intake never replaces escalation. Items needing the user now still
get `ready-for-human`, `needs-info`, `Blocked`, or the configured human-attention
state plus notification.

Never paste secrets, diffs, customer data, signed URLs, private logs, or tokens
into friction intake. Use metadata, IDs, and counts only.
