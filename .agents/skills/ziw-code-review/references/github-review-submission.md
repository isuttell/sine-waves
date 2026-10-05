# GitHub Review Submission

Use this reference only for an explicit GitHub PR review with `--submit`.
Review locally first, then publish the same verdict and actionable findings as
one GitHub pull-request review.

## Identity

Read `AGENTS.md` and repo workflow config before choosing the GitHub client.
Repo-specific identity rules win.

- For `zaks-io` repositories, use `gh-useotto` so the review is attributed to
  `useotto-dev[bot]`.
- Elsewhere, use the configured GitHub CLI command and identity. If write
  identity is unknown, stop before submission and report the blocker.
- Plain `gh` is reserved for actions that repo policy assigns to the human
  account, such as triggering an external review bot. Local review submission
  is not an external-bot trigger.

Use the repo-configured account login as the expected reviewer identity. Compare
it with API `user.login` on existing and submitted reviews, not a display name,
Git author, or identity claimed in the body.

Never print tokens, credentials, private keys, or authenticated headers.

## Freshness

1. Resolve repository owner/name, PR number and URL, base SHA, and current
   `headRefOid` from GitHub.
2. Confirm the locally reviewed head exactly equals the current `headRefOid`.
3. Complete the local report, including mode, evidence recommendation,
   verdict, conformance, and P0-P2 findings, before checking for a duplicate.
4. Inspect existing reviews and their inline comments through the GitHub API.
   Reuse a review only when all of these facts match the completed local
   report:
   - the API `commit_id` equals the reviewed full head SHA
   - API `user.login` equals the configured reviewer account
   - API state is `COMMENTED` and `submitted_at` is present
   - the body contains the exact marker
     `<!-- ziw-local-review head=<full-sha> -->`
   - review mode, review-evidence recommendation, verdict, and conformance are
     compatible with the completed local report
   - the body and inline comments cover every actionable P0-P2 finding in the
     completed local report
5. Recheck the current PR head before returning an existing review URL or posting.
   If it changed, refresh and rerun review. Reuse only after all checks pass.
   Otherwise post the completed current review. A matching marker alone is not evidence, and
   a prior clean review cannot replace a report with new findings.

Do not reuse a mismatching, incomplete, pending, dismissed, or forged review.
Do not treat a review on an older commit as current evidence.

## Review Shape

Submit one review through:

```text
POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews
```

Field definitions: [GitHub review API](https://docs.github.com/en/rest/pulls/reviews).

Use a JSON payload with:

- `commit_id`: the exact reviewed head SHA
- `event`: `COMMENT`
- `body`: the compact review report, verdict, checks, and hidden freshness
  marker
- `comments`: one inline comment per actionable finding that can be attached to
  the PR diff

Always use `COMMENT`. Put `APPROVE`, `NEEDS REVISION`, or `DO NOT MERGE` in the
review body as the workflow verdict. Do not use GitHub `APPROVE` or
`REQUEST_CHANGES`; the local bot may be reviewing its own implementation PR and
those events can alter protected-branch state or fail on actor rules.

Each inline comment should contain severity, confidence, concrete impact,
evidence, and the smallest fix direction. Use GitHub's `path`, `line`, and
`side` fields against the current diff. Use `start_line` and `start_side` only
for a finding that genuinely needs a range. If a finding is valid but cannot be
anchored to a changed line, keep its `file:line` evidence in the review body.

Submit P0-P2 findings only. Suppress P3/style comments and do not post the same
finding both inline and as a second top-level comment. A zero-finding review is
a body-only review with an empty `comments` list.

Build the JSON structurally with `jq` or an equivalent serializer and send it
through the selected CLI's `api --input` support. Do not interpolate review text
into shell source.

## Verification

After submission:

1. Verify the API response belongs to the expected PR and its `commit_id`
   equals the reviewed head.
2. Verify API `user.login` equals the configured reviewer account.
3. Verify its state is `COMMENTED`, its body has the exact marker, and the
   published body and inline comments preserve the completed local report's
   verdict and P0-P2 findings.
4. Capture its `html_url` and return
   `GitHub submission: POSTED <review URL>` in the review report.

If the API rejects an inline location, correct the payload once by moving that
finding into the review body. Do not fall back to scattered issue comments or a
plain top-level PR comment. On any other failure, return `FAILED` with the safe
error summary and preserve the local report.

## Done

Submission is done when one current-head GitHub review exists, its body carries
the local verdict and freshness marker, every attachable P0-P2 finding appears
once as an inline thread, and the returned report includes the review URL.
