---
name: ziw-architecture
description: Assess codebase architecture and propose module interface or ownership improvements from concrete caller and change-history evidence. Use for requested architecture assessments or module design; this is advisory work, not a routine PR review gate or permission to refactor.
---

# Architecture

Find worthwhile structural improvements or design a named module interface.
Return evidence, alternatives, and a recommendation the user can act on.

## Inputs

- Requested assessment area or interface design problem and its constraints.
- Repo instructions, workflow config when present, real callers, tests, and
  relevant specs, glossary, and accepted ADRs.

## Choose the work

For an assessment, load [references/assessment.md](references/assessment.md)
and investigate the named area. For a module design, load
[references/codebase-design.md](references/codebase-design.md), trace its real
callers, and compare plausible interfaces. A named module request does not
require a whole-codebase assessment. Do not introduce this workflow as a
mandatory step for ordinary implementation or PR review; those callers may
consult the design reference directly for their scoped changes.

Read configured planning paths before discovering conventions. For unmapped
glossary paths, use [glossary-discovery.md](../ziw-grill/references/glossary-discovery.md).
For encountered friction, use [friction-log.md](../ziw-orchestrate/references/friction-log.md).

## Recommend

Separate observed implementation from intended behavior. Support each proposed
change with real caller knowledge, repeated orchestration, change locality,
or a verification gap. Cite affected paths and compare compatibility,
testability, migration cost, and domain ownership. Prefer existing interfaces
and the simplest design that resolves the observed problem. A future adapter
or a line-count preference alone does not justify a new abstraction.

Show concrete call examples or before/after dependency diagrams when useful.
Explain which behavior becomes easier to verify and at what public interface.
State recommendation strength and uncertainty. If no improvement earns its
cost, say so; do not manufacture candidates or infer defects from code alone.

## Handoff and authority

Assessment and design requests authorize investigation and proposals. Keep
proposed designs distinct from accepted decisions; do not implement code,
change tracker state, create tickets or PRs, or mark specs ready. An assessment
report may be returned in conversation or written to the requested location;
label written reports as proposals rather than current-truth specs.
Report ADR implications without creating or overriding an accepted ADR.

When the user selects a proposal with material unanswered decisions, hand its
evidence, alternatives, constraints, and ready questions to `$ziw-grill`.
Selection authorizes exploring that proposal, not accepting every design detail.
Grill owns confirmed specs and explicit readiness approval. An assessment may
end with recommendations; do not require an interview to finish it. A scoped
implementation caller retains its original acceptance and proof boundaries.

## Done

Return investigated scope, source evidence, candidates or the reason none
warrant change, interface alternatives, compatibility and migration implications,
verification opportunities, and unresolved decisions. Name the recommended next
action without launching implementation or ticket creation.
