# Architecture assessment

Use for a requested architecture assessment.
This is a planning step, not a routine PR gate or authorization to implement.

## Find concrete friction

Read the configured glossary, relevant specs, and accepted ADRs. Start with the
area the user named. Without a named area, use recent change history to find
frequently changed modules before widening the search.
If change history is unavailable, report that limitation and use current callers
and tests without inventing churn evidence.

Trace real callers and tests. Look for one behavior requiring edits across
many modules, callers repeating implementation knowledge, pass-through layers,
or bugs that existing tests cannot exercise through a useful public interface.
Use [codebase-design.md](codebase-design.md) to assess the candidates.

Separate structural observations from proposed behavior changes. Differing
callers may encode intended differences: do not call an omission a confirmed
defect without a spec or reproduction establishing expected behavior. Flag any
behavior a consolidation would change and keep its intent unresolved until
confirmed. Report suspected defects separately, with a proposed Debug handoff
within the user's scope; an assessment does not authorize repairing them.

Present only candidates supported by concrete examples. For each, give:

- affected modules and the observed problem, with source paths
- proposed ownership and interface change
- before/after caller or dependency diagrams when they clarify the change
- which behavior becomes easier to verify, and at what existing interface
- migration, compatibility, and ADR implications
- recommendation strength and the evidence behind it

If nothing warrants a change, say so. Do not manufacture a candidate to fill a
report. An ADR conflict is worth surfacing only when current friction justifies
revisiting that decision.

## Select and clarify

Recommend the strongest candidate and let the user select what to explore.
Finish the assessment after presenting recommendations unless the user asks
to explore one. Hand a selected proposal's unresolved constraints and interface
alternatives to Grill; it owns confirmed specs and readiness approval.
Create no tracker tickets or implementation changes here.

## Sources

Adapted from Matt Pocock's [improve-codebase-architecture](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/improve-codebase-architecture/SKILL.md).
