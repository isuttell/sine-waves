# Delegation Policy

Use this reference when launching local worktree workers, issue-assigned agents,
Cursor remote agents, or review/triage workers.

## Role Split

Orchestrator is the only active work loop. It decides the next workflow action
and delegates context-heavy work.

- Implementation workers write code, run required checks, use best judgment on
  whether `ziw-code-review` author QA adds value, and open or update their PR
  through `ziw-pr` before independent review. A new commit alone never requires
  another author-QA pass.
- Review workers run independent `ziw-code-review` from clean context and return
  findings or a clean verdict.
- Triage workers repair issue shape, dependencies, routing, readiness, and
  startable queue truth.
- Integrate handles merge authority and default-branch writes.
- Orchestrator handles routine GitHub PR branch updates with
  `gh pr update-branch <pr>`. Send branch-update work to a worker only when the
  update reports a merge conflict or equivalent manual conflict state.

Orchestrator reads tracker/PR metadata. It does not read diffs to review them
and does not patch source as part of orchestration.

## Prompt Rules

Build short prompts. The worker must fetch details from the repo, tracker,
branch, PR, or linked docs. Include hard literals only when the issue depends on
exact external config, resource IDs, provider names, label slugs, secret names,
or environment values.

Always include:

- repo path
- issue or PR URL/ID
- one-sentence scope
- explicit non-goals and sibling tickets not to deliver
- branch/worktree policy
- required checks or config reference
- constraints: preserve unrelated changes, no production deploy, no secrets
- role boundary: author QA is not independent review evidence; the implementer
  cannot mutate review-evidence labels or merge-ready state
- author-QA policy: use worker judgment based on risk, uncertainty, scope, and
  test evidence; do not require review after every change

If a critical literal exists only in a prior comment, update or route the issue
body first so the worker does not rediscover it from history.

## Implementation Prompt

```text
Use the isolated implementation worker for this runtime.
Claude Code: zaks-io-skills:ziw-implementer.
Codex or Agent Skills: $ziw-implement.
Repo: <path>
Issue: <id-or-url>
Branch/worktree: <branch-or-create-policy>
Scope: <one sentence from issue>
Non-goals: <out-of-scope line from issue, including sibling tickets; do not deliver adjacent work>
Required checks: <commands or config reference>
Constraints: preserve unrelated changes; no production deploy; no secrets. Use best judgment on whether author QA adds value; do not run or repeat it merely because a commit changed. Author QA is not independent review evidence. Do not apply or clear review-evidence labels, move the issue to `Ready to Merge`, or apply merge-ready PR labels.
Return the workflow handoff only.
```

## Review Prompt

```text
Use the isolated review worker for this runtime.
Claude Code: zaks-io-skills:ziw-reviewer.
Codex or Agent Skills: $ziw-code-review.
Repo: <path>
PR/branch/range: <target>
Base: <base branch or range>
Review target: <head SHA and review-diff fingerprint; one request per materially distinct diff>
Intent source: <issue or PR URL>
Required checks: <commands or config reference>
Return the review report and no code changes. Refuse an empty diff or a duplicate
equivalent-diff review request.
```

## Triage Prompt

```text
Use the isolated triage worker for this runtime.
Claude Code: zaks-io-skills:ziw-triager.
Codex or Agent Skills: $ziw-triage.
Repo: <path>
Scope: <ticket list, query, project, Linear Backlog, intake scope, or delivery scope>
Goal: <make ready/current work truthful/until Linear Backlog clear>
Authority: <config mutation authority summary>
Backlog gate: <whether Linear Backlog review/backfill was explicitly requested>
Return changed issues, newly startable issues, blockers, and questions.
```

## Issue-Assigned Agents

Use issue-assigned agents only when the issue tracker exposes an assignable
coding agent or config has a verified delegation field/tool/agent ID. This is
tracker assignment, not a local CLI invocation. The agent may be Cursor, Codex,
or another configured worker.

Before starting issue-assigned work, verify:

- issue resolves by configured tracker ID
- status, readiness labels, routing labels, priority, body contract, blockers,
  and dependencies are current
- issue has one primary outcome with concrete in-scope and out-of-scope text
- configured repo-route label is present or safely repairable
- requested agent/delegation mechanism is verified
- issue is not already claimed, delegated, linked to an open PR, or represented
  by another active worker session
- the worker concurrency cap has headroom; PR and preview inventory is not worker capacity

Do not mutate a real issue to probe agent capability. Use read-only metadata,
documented config, or stop with the missing setup item. If the user explicitly
approves a probe, use a dedicated test issue and restore it afterward.

## Remote Continuation

The assigned agent owns its environment, branch, implementation run, review, and
PR return path. If fixes or scope changes are needed, reply directly to the same
session target: the latest agent comment thread, configured reply location, or
provider-specific continuation target.

For remote Cursor agents, do not post a top-level issue comment unless config
verifies that top-level comments continue the assigned-agent session. If no
direct reply target can be found, stop with the missing continuation path
instead of starting a second agent.

When scope or instructions change mid-session, send one authoritative reply that
explicitly supersedes earlier guidance. Conflicting dispatch notes, session
replies, and top-level comments cause workers to follow the wrong instruction
layer.

## Worker Environment Metadata

Configured worker environment labels or fields, such as `remote-cursor`, are
approval metadata. Apply or preserve them when issue identity, repo route, and
repo-configured environment approval criteria are verified. Do not require
dependency blockers to be clear just to apply the environment label.

Remote eligibility is not a global implementation gate. Security-sensitive,
schema, migration, and cross-cutting tickets may be correctly barred from a
remote worker while remaining authorized for a local worker. Route them locally
when the local budget policy allows it, and record a local-budget hold only when
that specific path is paused.
