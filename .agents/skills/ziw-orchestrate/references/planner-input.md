# Planner input contract

Read this when assembling JSON for `scripts/tick-plan.mjs`. The complete field
and type contract is [planner-input.schema.json](planner-input.schema.json).
The planner validates every input before computing actions. Invalid input exits
with status 1, writes the field path and error to stderr, and emits no plan.

## Input files and precedence

Pass the output of `tick-snapshot.mjs` directly, or wrap it in an envelope:

```json
{
  "snapshot": {
    "repo": "owner/repo",
    "prs": [],
    "linear": { "issues": [] }
  },
  "config": {
    "workerConcurrencyCap": 3,
    "readyState": "Todo",
    "mergeAuthority": "human",
    "requireConformanceEvidence": true
  },
  "state": {}
}
```

The empty collections above are illustrative. Populate them from current
provider evidence; never replace an unavailable query with an empty collection.

```bash
node <skill-dir>/scripts/tick-plan.mjs <snapshot-or-envelope.json> \
  --config <config.json> --state <state.json>
```

- `--config` overrides matching inline `config` fields.
- `--state` overrides matching inline `state` fields. The legacy `queue`
  object has lower precedence than both.
- Merges are shallow. A supplied map replaces the earlier map in full.
- Direct snapshot fields may accompany inline config/state. Do not also supply
  a nested `snapshot`; that would make the evidence source ambiguous.
- `snapshot.repo` or `state.repo` must identify `owner/repo`. When both exist,
  they must match.
- `-` reads stdin for one file. `--pretty` formats the plan; `--debug` includes
  full decision evidence. Missing option values and unknown flags are errors.

Each file must contain a JSON object. Validation runs before merging, so an
override cannot hide invalid earlier input. Empty files, `null`, and arrays at
the document root are errors.

## Policy and evidence

Derive config values from verified `docs/agents/workflow/config.md` settings.
The Markdown file is not a JSON input. Include only keys the planner consumes;
the schema lists those keys and their supported aliases. Unknown config,
envelope, state, and review-evidence fields are errors. Provider records such as
PRs, issues, and worktrees may retain additional metadata; only their documented
fields affect decisions.

| Repo setting                 | JSON field                                                 | Accepted value                                              |
| ---------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Worker concurrency cap       | `workerConcurrencyCap`                                     | Integer at least 0                                          |
| Ready state                  | `readyState`                                               | Tracker state name                                          |
| Merge authority              | `mergeAuthority`                                           | Configured authority, such as `human` or `agent`            |
| Delivery mode                | `deliveryMode`                                             | `production` or `velocity`                                  |
| Auto-merge risk tiers        | `autoMergeRiskTiers`                                       | Tier or array of `low`, `medium`, `high`                    |
| Required independent reviews | `requiredIndependentReviews`                               | Positive integer or object keyed by risk tier               |
| Require conformance evidence | `requireConformanceEvidence`                               | Boolean                                                     |
| Local budget stops           | `localBudgetSoftStopPercent`, `localBudgetHardStopPercent` | Both supplied, between 0 and 100, soft no greater than hard |

Omitted optional policy fields retain the workflow helpers' existing defaults,
except merge authority: an omitted or blank `mergeAuthority` routes every
merge-ready PR to human merge. Always pass it from config.
Validation never inserts defaults, removes fields, or converts types. Write
`false`, not `"false"`, and `3`, not `"3"`. Empty label strings remain supported
where the workflow uses them to disable a label. Policy enums use lowercase.

Queue collections must be arrays. PRs and issues need an identifier supported by
their consumer. Explicit `startableTickets` need `id` or `identifier`; they are
already-verified candidates, so the caller remains responsible for readiness.
Snapshot issues are evaluated by the dependency planner instead.

`reviewEvidenceByPr` and `hostedReviewByPr` contain objects keyed by the PR
number, ID, URL, head SHA, or branch. Review-request maps use the PR number or ID.
`reviewEvidenceChecks` entries need `pr` or `ticket` so a label action has an
addressable target. Use raw identifiers, without `pr:` or `ticket:` prefixes.
Keep verdicts, fingerprints, review counts, and conformance evidence tied to
current provider evidence. Valid JSON does not prove that the evidence is true
or current, and it grants no mutation authority.

## Maintaining the contract

Schema source lives in this repository's `scripts/planner-schema/`. Regenerate
the published schema and validator after changes:

```bash
pnpm generate:planner-contract
pnpm check
```

`pnpm check` rejects stale generated artifacts. The published validator uses
[Ajv standalone generation](https://ajv.js.org/standalone.html), so copied skills
validate inputs without an Ajv install or runtime code generation. Tests exercise
both malformed inputs and the copied skill's CLI.
