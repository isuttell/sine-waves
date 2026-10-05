# Planning Artifacts

Use the repo's established formats when they satisfy this semantic contract.
Use the defaults below only when the repo has no convention.

## Authority

Planning artifacts have distinct jobs:

1. Current-truth specs define agreed behavior and constraints.
2. Context or glossary docs define canonical domain language and relationships.
3. ADRs preserve why a hard-to-reverse, surprising tradeoff was chosen.
4. Code shows current implementation and can contradict intended behavior.
5. Tracker tickets slice ready specs into executable work; they do not replace
   the spec.
6. Chat transcripts and scratch notes are non-authoritative working context.

When sources conflict, identify the contradiction and ask the user to resolve
intent. Do not silently choose code, an older ADR, or a ticket over the
current-truth spec.

## Discovery

Read the `Planning Artifacts` section of
`docs/agents/workflow/config.md` first when present.

Without a configured map:

- look for a spec authority index such as `docs/specs/README.md`
- inspect `docs/specs/`, project PRDs, roadmaps, and linked specs
- use [glossary-discovery.md](glossary-discovery.md) for unmapped glossary paths,
  authority conflicts, and current or legacy context maps
- inspect the repo's ADR index and naming convention before creating an ADR
- inspect package scripts and CI for documentation formatting, lint, link, and
  anchor checks

If no convention exists, create files lazily:

- current-truth spec: `docs/specs/<topic>.md`
- single-context glossary: `GLOSSARY.md`
- system-wide ADR: `docs/adr/NNNN-<decision>.md`

Do not create an empty directory, index, glossary, or ADR collection.

Configured paths take precedence over filename defaults. The glossary
discovery reference owns compatibility and naming migration rules.

## Spec Contract

Preserve existing headings when they make these elements findable and linkable:

- status
- outcome
- scope
- non-goals
- canonical terms and actors
- behavioral rules
- concrete scenarios and edge cases
- failure and recovery behavior
- security, privacy, data, and operational invariants where relevant
- acceptance signals
- blocking and deferred questions
- related specs and ADRs

For a repo without a spec format, use:

```md
# <Capability>

Status: Draft

## Outcome

## Scope

## Non-goals

## Language and actors

## Behavioral rules

## Scenarios and edge cases

## Failure and recovery

## Invariants

## Acceptance signals

## Open questions

## Related decisions
```

Use `Status: Draft` during grilling and `Status: Ready for slicing` only after
the user approves the final readiness recommendation. If an existing repo uses
another explicit status format, preserve it and map its equivalent values in
workflow config.

## Pre-approval Gate

Ask the final readiness question only when:

- the outcome and actors are clear
- scope and non-goals draw a usable boundary
- canonical terms are resolved
- behavioral rules cover the important lifecycle
- concrete scenarios probe boundaries and edge cases
- failure and recovery behavior is explicit where failure is possible
- relevant security, privacy, data, and operational invariants are stated
- acceptance signals are observable and verifiable
- no unresolved contradiction can materially change slice boundaries
- each open question is labeled `blocking` or `deferred`
- every deferred question has a reason it does not block slicing

Do not mark a spec ready merely because the conversation has become quiet.

After the user approves `Ready for slicing`, change the status and run the
relevant documentation checks. A failed check returns the spec to `Draft`.
Report the exact failure, fix in-scope document defects, and rerun the check. The
spec is handed to To Issues only after approval and passing checks.

## Context And Glossary

Use a glossary only for domain-specific concepts. Define what a term is in one
sentence, name aliases to avoid, and state important relationships or
cardinality. Keep implementation mechanisms, generic programming terms, specs,
and decision rationale out.

For new multi-context layouts, use a root `GLOSSARY-MAP.md` linking context
glossaries and their relationships; preserve a configured legacy map. Put a
term in the context that owns its meaning. Ask only when ownership cannot be
discovered.

## ADR Gate

Create an ADR only when all three are true:

1. Reversal would be meaningfully expensive.
2. A future reader would find the choice surprising without its rationale.
3. Real alternatives existed and the decision selected among tradeoffs.

If any test fails, keep the behavior in the current-truth spec and skip the ADR.

Preserve the repo's ADR format and numbering. Without a convention, scan
`docs/adr/` for the highest four-digit prefix and increment it. A minimal ADR is:

```md
# <Decision>

Status: Accepted

<Context, decision, and why it won over the meaningful alternatives.>
```

Add considered options and consequences only when they preserve information a
future reader needs.

## Validation

Use configured documentation checks. Otherwise inspect available scripts and CI
for the narrowest relevant format, Markdown lint, local-link, and anchor checks.
Always run `git diff --check` when working in Git.

Validation proves document integrity, not product correctness. The user
confirmation and readiness gate prove the planning handoff.
