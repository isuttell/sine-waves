# Handoff Contract

Use this shape when one workflow role leaves work for another role, the user,
or a future run. Keep it short and factual.

When the handoff escalates to the user, it must also carry a decision request.
An escalation that hands the user a PR or ticket to go study is invalid; frame
the decision or keep the work.

```markdown
## Decision Request

- Question: <one sentence>
- Options:
  - <option A>: <tradeoff>
  - <option B>: <tradeoff>
  - <option C, when it adds a distinct useful choice>: <tradeoff>
- Recommendation: <option and why>
- Blocks: <what waits on this decision; what proceeds without it>
```

```markdown
## Handoff

- Issue:
- Branch:
- PR:
- PR head SHA:
- Base SHA:
- Merge base:
- Owner:
- Agent path:
- Environment:
- PR state:
- Current state:
- Next owner:
- Next action:
- Files changed:
- Scope audit:
- Checks:
- Hosted checks:
- Code review:
- Review evidence:
- Hosted bot review:
- Tracker updates:
- Blockers:
- Residual risk:
```

Rules:

- Include links or IDs, not pasted private logs or secrets.
- Say whether code review covers the current diff.
- Say whether the diff stayed inside the linked issue's in-scope and
  out-of-scope boundary. If it did not, name the split, revert, or human
  decision needed before handoff.
- Record the current PR head SHA, base branch SHA, and merge base used for
  review and checks. If any are unknown, say unknown and who must refresh them.
- List exact check commands and results. If conflicts were resolved, docs were
  touched, or the branch was updated after main moved, include the final command
  evidence after that event.
- When Markdown or docs changed, include the configured docs formatting check,
  such as `pnpm format:docs:check` when the target repo provides it.
- Say whether the configured review evidence label is applied, removed, or
  requested for the current PR head SHA.
- Say whether the configured code-host human-merge PR label, such as
  `needs-human-merge`, is applied, removed, or requested, and list the
  merge-ready evidence that justifies it.
- Say whether the PR is draft/pre-review or non-draft/ready-for-review, and who
  owns any required ready-for-review transition.
- Say whether hosted bot review is skipped, complete, auto-review pending, or
  still required for the current diff. Include provider, auto-review mode,
  trigger policy, and the command or PR-description marker used when known, such
  as `@coderabbitai full review` or `@coderabbitai ignore` for CodeRabbit. For
  Cursor Bugbot, name the verified trigger or say it is unresolved.
- Say which hosted checks were observed for the current head, whether they were
  pending, passing, failing, or still progressing, and whether they used local,
  development, preview, or production resources.
- Leave active tracker status changes to Agent Orchestrator unless the user
  explicitly says otherwise. Issue Triage may reconcile verified stale states
  such as merged work marked done, and may promote complete configured intake
  issues during a normal triage run. Linear Backlog promotion still requires an
  explicit Linear Backlog cleanup request.
