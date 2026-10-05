---
name: ziw-pr
description: Use when opening, refreshing, or shipping the current branch as a pull request with local checks, judgment-based author QA, Conventional Commits, PR creation, and issue tracking.
argument-hint: "[issue-id|branch|pr-url]"
---

# Create PR

Take the current code to a non-draft ready-for-review PR. Do the whole workflow
unless blocked.

For encountered friction, use [friction-log.md](../ziw-orchestrate/references/friction-log.md)
with the configured complaint store and this role's mutation authority.

## Inputs

- Current branch and all intended staged or unstaged repo changes.
- Optional issue ID, branch name, or PR URL from the invocation.
- Repo config for checks, branch naming, PR format, and tracker updates.

## Context

Read `docs/agents/workflow/config.md` first. If missing, infer the minimum from
repo files and note that `ziw-setup` should be run.

Gather in parallel:

- `git status --short`
- `git diff HEAD`
- `git branch --show-current`
- `git log --oneline -10`
- existing PR for the branch

## Issue Tracker

Find or create tracking before naming the PR:

1. If the branch or commits include an issue ID, fetch that issue.
2. Otherwise search the issue tracker using branch name, commit subjects, touched packages,
   and diff keywords.
3. If exactly one issue is a strong match, use it. If matches are ambiguous,
   ask. If none exists and the change is non-trivial, create a tracking issue
   in the configured provider location with the repo routing label.
4. Capture original intent: title, scope, out of scope, acceptance criteria,
   required checks, and linked docs.
5. Compare the current diff to that intent. A PR may satisfy the assigned issue
   and directly required mechanics; it must not quietly deliver adjacent tickets,
   optional polish, broad refactors, or behavior named out of scope.

Skip issue tracker only when tools are unavailable or config lacks enough information.
Record the skip in the final report.

## Scope And Branch

- Never push to the default branch.
- If already on a feature branch, use it.
- If on the default branch or detached HEAD, create a branch using the repo
  config branch prefix, such as `<branch-prefix>/<issue-id>-<short-slug>` when
  an issue exists.
- If a PR already exists for this branch, update that PR instead of creating a
  duplicate.
- Include all staged and unstaged repo changes by default, except secrets.
- If the diff is unrelated work mixed together, stop and ask how to split.
- If the diff contains work outside the tracked issue boundary, split, revert,
  or ask before creating or updating the PR. Do not use one PR to close multiple
  tickets unless the user explicitly requested a multi-ticket PR and config
  allows it.

## Checks

Run the repo full local gate from config. If absent, discover it from package
scripts, CI, Makefile, Justfile, lockfiles, and touched languages. When Agent
Implement reports the gate and threshold checks passing on the exact tree being
committed, reuse those results; run only checks it skipped or that a later file,
manifest, generated-artifact, or environment change invalidates.

Use the configured command and runner for each check. Do not infer a test runner
from filename alone, and do not replace the full gate with a package-local alias
when CI enforces broader build, typecheck, coverage, generated-artifact, smoke,
or secret-scan checks. When running secret scanning locally, use the same
branch, diff, or source scope that CI uses instead of scanning unrelated local
refs.

If CI exposes coverage, smoke, or secret scanning as separate threshold jobs,
run the configured local equivalent before PR handoff when the current diff
touches that surface. A passing full local gate is not enough when config says a
threshold job lives outside that gate.

When CI has threshold gates, cache-sensitive tasks, or env-filtered test gates,
run the exact threshold-enforcing and cache-busted command named by config. A
cached green local gate is not PR evidence unless config says the cache is valid
for the current diff and environment.

If the branch changes package manifests, lockfiles, generated artifacts, or the
workspace dependency graph, run the repo-configured install, lockfile validation,
or artifact refresh before the final gate.

If Markdown or docs changed, run the configured docs formatting check before the
PR handoff. Use `pnpm format:docs:check` when that command exists in the target
repo. Do not rely only on pre-commit hook installation or CI to prove docs
formatting.

Run focused checks for high-risk touched areas. Fix mechanical failures and
rerun. Never use `--no-verify`.

## Code Review

Before committing, decide whether author QA would materially improve confidence.
Use a fresh `ziw-code-review` for high-risk, broad, unfamiliar, weakly tested, or
ambiguous changes, or when explicitly requested. Reuse current author-QA
evidence when it still applies. Skip author QA for low-risk, mechanical,
well-covered changes when required checks provide enough evidence. A changed
diff or new commit alone is not a reason to run or repeat author QA, and Create
PR must not duplicate Agent Implement's judgment without a concrete risk signal.
If review runs, fix P0/P1 findings and obvious mechanical P2 findings. Ask before
broad architecture, product, security, or data-behavior changes. When Create PR
runs inside Agent Implement, this is author QA, not independent review evidence.

Use the configured hosted bot review provider per the merge-safety rules in
[../ziw-setup/references/operating-profile.md](../ziw-setup/references/operating-profile.md)
and the `ziw-code-review` recommendation. CodeRabbit and Cursor Bugbot are both
valid providers when repo config enables them. Use hosted bot review only for
high-risk changes, when repo policy requires it, or when the user asks.

Do not post hosted-review commands or run a provider CLI until the provider,
auto-review mode, trigger policy, and current hosted review state are resolved.
If a hosted review is enabled, pending, or complete for the current
review-relevant diff, do not request another; report it as `auto pending` or
`complete` and hand off.
Evaluating its findings belongs to Orchestrator. Never use CodeRabbit CLI for an existing PR, and
do not apply CodeRabbit commands to Cursor Bugbot. Use `@coderabbitai ignore` in
the PR description only when CodeRabbit policy allows skipping optional
auto-review. For Cursor Bugbot, use only the repo-configured trigger or
automatic review policy; report `unresolved` if the trigger is unknown. Missing
auth, rate limits, or credits are a recorded skip, not a blocker, unless repo
policy or the user requires that provider; then report `unresolved`.

## Commit

- Stage with `git add -A`.
- Unstage `.env*`, credential files, local secrets, and unintended lockfiles.
- Use Conventional Commits.
- Include the configured issue trailer or link when an issue exists, such as
  `Issue: <ISSUE-ID>`, `Fixes #123`, or the repo's configured equivalent.
- If hooks fail, fix root cause and create a new commit. Do not amend published
  commits unless the user explicitly asks.

## PR

Create or update a ready-for-review PR unless the user asked for draft or a
required review gate has not passed. Ready-for-review means non-draft.

If an existing PR is draft, mark it ready-for-review when required local checks
pass, no known blocker remains, and the user did not ask to keep it draft.
Refresh the code-host PR state afterward and verify it is non-draft. If
hosted bot review `PR REVIEW` is recommended for a high-risk or complex open
PR, report that post-PR escalation in the handoff; do not use draft state as a
holding pen after author QA is clean.

If the user or repo config requires a draft PR, report the PR as a draft
pre-review handoff. Do not call it ready-for-review until it is marked non-draft
in the code host.

PR title:

- Use the tracker issue title when available.
- Keep under 70 characters when practical.

PR body:

```markdown
## Summary

[why this change exists]

## Changes

- [key change]

## Risk: LOW | MEDIUM | HIGH

- Areas touched:
- Security:
- Performance:
- Breaking:

## Test plan

- [ ] [command or verification]

[Issue: ISSUE-ID](url)
```

Risk is HIGH for auth, authorization, secrets, destructive data, schema
migrations, queues/background jobs, production data flow, public contracts, or
broad refactors. MEDIUM is normal feature/business logic work. LOW is docs,
tests, copy, or isolated UI.

## Issue Tracker Update

When an issue exists:

- attach the PR URL
- report the configured review-state transition, usually `In Review`, for
  Agent Orchestrator
- if this PR is part of a direct single-ticket orchestration, perform the
  configured review-state update for that issue only when config or the user
  grants mutation authority
- when the repo uses Linear + GitHub and the PR is linked to the ticket, assume
  the integration sync is active and may advance Linear state from PR status; do
  not duplicate manual state changes unless config delegates that authority
- comment with checks run, author-QA decision or verdict, hosted bot review decision,
  PR draft or ready-for-review state, current PR head SHA, base SHA, merge base,
  independent-review request or current independently reviewed head evidence,
  acceptance criteria status, scope-boundary status, hosted check state, and
  differences from original intent
- never move to `Done`; merge is not complete

Create PR does not own approval state. Author QA is not independent review
evidence. Do not apply or clear review-evidence labels, move the issue to
`Ready to Merge`, or apply merge-ready PR labels. Agent Review produces review
evidence; Agent Orchestrator owns those tracker and PR mutations.

Do not move workflow state unless the repo config or user explicitly delegates
that authority to Create PR.

## Done

Report:

```text
PR:     <url>
Title:  <title>
Risk:   <LOW|MEDIUM|HIGH>
Checks: <commands and result>
Review: author QA <skipped with reason|verdict>; hosted bot <provider skipped|CLI|PR review|auto pending|complete|unresolved>
Evidence: head <sha>; base <sha>; merge-base <sha>; hosted checks <state>
PR state: <draft|ready-for-review>
Scope: <matches issue|split needed|untracked, with reason>
Issue:  <issue, handoff status, created, or skipped>
Next:   <owner and exact next action>
```

## Guardrails

- Never bypass hooks.
- Never commit secrets.
- Never force-push unless the user explicitly requested it for an existing PR
  maintenance flow.
- Never deploy production manually.
