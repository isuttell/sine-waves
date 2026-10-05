# Remote Worker Review

Use this when the user asks for a remote worker agent to review a branch or PR.

## Start Options

- Use the repo-configured remote worker provider from
  `docs/agents/workflow/config.md`.
- Launch a review-only run against the PR branch or head ref.
- Start a fresh reviewer session with no implementation conversation context.
  A separate worktree isolates files only; it does not make a reused session an
  independent reviewer.
- Set auto-PR creation off when the provider supports that option.
- Supply the installed `ziw-code-review` skill path with the prompt below. If the
  worker cannot access it, provide the skill and its applicable references.
- Do not print, store, or commit provider API keys.

For remote review, assume hosted secrets are opt-in per issue. Default to local
checks only unless the prompt explicitly authorizes preview or production
credentials.

## Prompt Template

```text
Code review only. Do not edit files, commit, push, or open a PR.

Repo/branch: <repo and branch or PR URL>
Immutable target SHA: <full reviewed head or checkpoint SHA>
Base SHA or merge base: <full SHA>
Intent: <user request or issue outcome>
Linked issue and acceptance criteria: <issue URL/key and exact criteria, or explicitly missing>
Cited spec sections: <exact sections, or none>
Required checks: <configured commands and code-host checks>
Review-diff fingerprint: <orchestrator-supplied value, or explicitly missing>
Review skill: <installed ziw-code-review/SKILL.md path or supplied instructions>

Read first:
- The supplied review skill and its applicable references
- AGENTS.md or CLAUDE.md
- docs/agents/workflow/config.md if present
- docs/agents/remote-worker-agent.md or provider adapter docs if present
- The configured glossary; otherwise discover GLOSSARY.md or legacy CONTEXT.md
  using the glossary-discovery reference supplied by the review skill
- docs/specs/README.md and docs/adr/README.md if present
- Any repo-local skills relevant to touched files

Review the diff against the base branch for correctness, security, data loss, race conditions, API/schema contract drift, missing enum/status handling, missing tests, and scope drift. Scope drift includes delivering adjacent tickets, optional polish, broad refactors, or new surfaces outside the issue boundary. Run focused checks if cheap. Do not call hosted bot review providers such as CodeRabbit or Cursor Bugbot from this worker.

Resolve the target only from the immutable target SHA. Confirm the checkout and
diff match the supplied target and base before reviewing. Stop with a stale or
missing-input result if they do not. Treat a missing orchestrator fingerprint
as missing evidence. Do not derive one from the head SHA.

Use this review rubric:
- Verify every finding with file:line evidence.
- Prioritize P0/P1 correctness, security, auth, data-loss, migration, concurrency, and API-contract issues.
- Treat config/numeric limit changes as high-risk until justified by production bounds, rollback, and monitoring.
- Suppress style nits, low-confidence speculation, broad refactors, and optional micro-optimizations.

Return the canonical `## REVIEW REPORT` defined by the supplied review skill,
including conformance and the applicable workflow/PR handoff fields.
Do not substitute a reduced report. Do not fix findings, trigger hosted review
bots, mutate tracker or code-host state, or perform merge or deployment work.
```
