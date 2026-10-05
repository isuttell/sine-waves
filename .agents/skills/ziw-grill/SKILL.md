---
name: ziw-grill
description: Grills plans or specs in rounds of independent questions and produces authoritative specs ready for ticket slicing. Use for requested grilling or material product, domain, scope, or architecture ambiguity that blocks safe progress after evidence is checked.
argument-hint: "[idea|plan|spec-path|prd|adr]"
---

# Grill

Turn fuzzy or contradictory plans into shared understanding and authoritative
planning artifacts. Grill owns clarification, not tickets or implementation.

## Inputs

- An idea, plan, question, PRD, ADR set, or existing spec to challenge.
- The current repo, caller context, and workflow config when available.

## Invocation Threshold

Explicit invocation always starts. Invoke implicitly only when an unresolved
product, domain, scope, or architecture decision could change behavior, ticket
boundaries, risk, dependencies, or required proof after available evidence is
checked. Say what ambiguity caused the pause. Do not invoke for routine details,
harmless preferences, or discoverable facts.

## Context

Read repo instructions first. Then read the planning-artifact mapping in
`docs/agents/workflow/config.md` when present. Load
[references/planning-artifacts.md](references/planning-artifacts.md) for
authority, default formats, ADR rules, and the readiness contract.

Load additional references only for the matching work:

- Designing or changing a module interface:
  [codebase-design.md](../ziw-architecture/references/codebase-design.md).
- Planning across sessions: [references/resumable-planning.md](references/resumable-planning.md).
- Encountered friction: [../ziw-orchestrate/references/friction-log.md](../ziw-orchestrate/references/friction-log.md).

If config does not map planning artifacts, discover existing specs, context or
glossary files, ADRs, roadmaps, and relevant implementation. Preserve the
established convention and report the missing mapping as a Setup gap.

Treat code and external systems as evidence, not automatically as intended
behavior. For existing artifacts, run a contradiction and requirement-coverage
pass first. For a new idea, build the decision tree from scratch. Both paths
converge on the same readiness contract.

## Grilling Loop

1. Build a private decision tree ordered by dependency and impact. Cover only
   applicable outcome, actor, language, scope, behavior, data, security,
   failure, concurrency, integration, operations, rollout, and acceptance
   branches.
2. Resolve discoverable facts from code, docs, config, or authoritative sources.
3. Ask the ready questions in one numbered round, ordered by impact. A ready
   question has no unresolved prerequisite. Give each question evidence, a
   recommended answer, and its consequence. Keep rounds easy to answer; split
   a large frontier into coherent batches. A single ready question stays single.
   If one answer could change another question's options or recommendation,
   ask the dependent question later. Authoritative facts need no reconfirmation.
4. Wait for the user's answers. Record only what each answer confirms, without
   adding exclusivity or other unstated constraints. Keep unanswered ready
   questions in the next round unless the user explicitly defers them. Ground
   recommendations in this task's evidence and label assumptions. Questions
   depending on an answer in this round belong to a later round. Investigate
   facts independently, but never answer a product or architecture decision on
   the user's behalf.
5. Challenge vague terminology and propose one canonical term.
6. Stress-test the answers with concrete scenarios, especially boundary,
   lifecycle, failure, concurrency, authorization, and recovery cases.
7. After explicit confirmation, update the smallest authoritative artifact set
   immediately and keep the active spec `Draft`.
8. Recompute the tree and repeat until the pre-approval gate can pass.

## Artifact Updates

Update the spec that already owns the behavior, or create one focused spec when
none does. Update context docs only for domain language. Create an ADR only
after a confirmed decision passes all three ADR tests in the reference. Never
substitute an ADR, transcript, scratch note, or ticket for current truth. In
conversation-only use, emit a self-contained Markdown spec.

## Readiness

Keep the active spec `Draft`. After the reference's pre-approval gate and final
contradiction pass, present the recommendation, outcome, non-goals, deferred
questions, changed artifacts, risks, and assumptions.

Ask exactly one final question: `Mark this spec ready for slicing?`

Only explicit confirmation may change status to `Ready for slicing`. Run
configured documentation checks. Failed checks return the spec to `Draft`.

## Caller Handoff

Return to an implementation caller only when no ticket scope, risk, dependency,
acceptance, or proof boundary changed. Otherwise stop implementation, never
widen the PR or silently rewrite tracker work. Handoff with:

- File: `$ziw-to-issues <spec-path>`
- Conversation: `$ziw-to-issues use the Ready for slicing spec in this conversation`

## Guardrails

- Do not create or edit tracker tickets.
- Do not invoke To Issues, implement code, open PRs, merge, or deploy.
- Do not edit planning artifacts before the user confirms the decision.
- Do not ask a question that available evidence can answer.
- Do not expose secrets or private customer data in planning artifacts.

## Done

Report spec status and path, decisions and evidence, changed artifacts, blocking
and deferred questions, checks, Setup gaps, and either the next question round
or the exact file-backed or conversation-only To Issues handoff.
