# Hosted review

Use for existing PRs or an explicit hosted-review request. Recommend actions;
this skill does not trigger bots or change PR state.

## Current evidence

Read repo workflow config, provider config at the reviewed head, and current PR
reviews, bodies, and every inline comment, including human reviews. A clean
summary with unresolved blocking inline findings is not a clean review.

Report auto-review as enabled, disabled, opt-in, provider-specific, or unknown.
For CodeRabbit, check root `.coderabbit.yaml` and `reviews.auto_review`. For
Cursor Bugbot or other providers, use verified repo policy. Include draft and
incremental-review behavior only when it changes the recommendation.

## Recommendation

- Default to `SKIP` after clean review of low-risk changes.
- Recommend `PR REVIEW` for an existing PR when required by repo policy,
  explicitly requested, or warranted by risk, complexity, or unresolved
  uncertainty. Examples include auth, secrets, payments, destructive data,
  migrations, background jobs, public contracts, and cross-cutting refactors.
- If a current review is pending, recommend `WAIT` with no command. If automatic
  push review is enabled and the current diff is eligible, let it run without
  another trigger. If auto-review mode, actor, or permissions are unknown,
  report the gap and recommend no command. A completed current review needs no
  duplicate trigger; evaluate its findings.
- Recommend `CLI` only for an explicit local CodeRabbit request before a PR
  exists. Never use it as fallback for a hosted PR review or infer a Bugbot CLI.
- Missing auth, credits, or rate limits may policy-skip optional review. Report
  required or explicitly requested provider failures as unresolved, not passed.

When a manual CodeRabbit trigger is warranted and repo policy permits it,
recommend `@coderabbitai review` for incremental review or
`@coderabbitai full review` when a full pass is needed. Optional automatic review
may be skipped with `@coderabbitai ignore` in the PR description only when repo
policy permits it. For other providers, recommend only verified configured
commands. The caller owns any authorized trigger or description edit.

Evaluate bot findings against source evidence. Prioritize P0/P1, security, data
loss, correctness regressions, production blockers, and user-requested findings.
Do not recommend keeping a locally clean PR in draft solely to wait for hosted
review; report whether review should run after Orchestrator marks it ready.

## Report fields

```text
Hosted bot review provider: <none | CodeRabbit | Cursor Bugbot | other | unknown>
Hosted bot review recommendation: SKIP | WAIT | CLI | PR REVIEW, because <reason>
Hosted bot review state: auto-review <enabled | disabled | opt-in | provider-specific | unknown>; hosted review <none | pending | complete | unknown>
Hosted bot review command: <none | verified command>
```

Keep unknown, pending, and policy-skipped states explicit. None is evidence of a
completed clean review. An unconfigured provider does not establish its automatic
review settings; report unknown settings rather than inferring they are disabled.
