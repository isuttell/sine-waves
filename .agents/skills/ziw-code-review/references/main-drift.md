# Main drift and review-debt intake

Use only for independent checkpoint review or explicitly authorized review-debt
intake. Ordinary PR review recommends follow-ups without creating tracker issues.
For intake without a main-drift request, skip checkpoint handling.

## Checkpoint review

Keep the checkpoint outside the repo:

```text
${CODEX_HOME:-$HOME/.codex}/automation-state/ziw-review/<repo-slug>/last-reviewed-origin-main
```

On first run, record current `origin/main` and stop unless backfill was requested.
Otherwise review the supplied checkpoint-to-current range as merged product
state. If the checkpoint is not an ancestor, report the history problem; do not
silently replace the range or advance the checkpoint over unreviewed work.

Collect spec sections cited by tickets linked to merged PRs in the range. Verify
merged behavior against those sections using the core conformance table. Report
escaped conformance drift separately from new bugs, with audited sections and
outcomes. Advance the checkpoint only after review and authorized issue updates
complete. Report incomplete intake and leave the checkpoint unchanged on failure.

## Tracker intake

Group findings that share one fix into one issue, then search for duplicates by
problem, files, PR, and range before creating or updating issues. Use the configured review-debt intake route, label, project, or parent.
If no dedicated route exists, use the configured normal repo route and report
the setup gap. If the provider/location itself is unknown, report the blocker.

- Use the configured provider location, routing label, and risk labels.
- Use `Bug` or `Tech Debt` unless another type clearly fits.
- Use `kind-slice` only for one concrete PR with acceptance criteria and checks;
  otherwise use `kind-spec` or `kind-epic` for To Issues to slice.
- Add `ready-for-agent` only when config allows review to create ready debt and
  the full issue-body contract is satisfied. Otherwise leave the issue in the
  configured review-debt intake route for triage. Use `needs-info` or
  `ready-for-human` only when a specific decision is missing, and name it.
- Include reviewed range and file evidence. Keep issue text metadata-only.

Escalate findings needing product, security, customer, credential, provider, or
ADR judgment instead of ticketing them. Suppress low-confidence, duplicate, and
style-only issues. Return issues created or recommended, checkpoint outcome when
applicable, and the next owner/action to Orchestrator.
