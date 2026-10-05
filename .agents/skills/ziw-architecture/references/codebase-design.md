# Codebase design

Use when designing or changing a module interface. Existing domain vocabulary,
repo patterns, and accepted ADRs govern the design.

## Evaluate the interface

A module presents an interface and hides an implementation. The interface
includes everything callers need to know: inputs, outputs, errors, ordering,
invariants, configuration, and relevant performance limits.

Prefer a small interface that hides substantial behavior. Judge it by what
callers must understand and how many places a change touches, not by the ratio
of implementation lines to interface lines.

- Trace real callers. Find repeated orchestration or knowledge that the module
  could own once.
  For a new module, use confirmed spec use cases as prospective callers; identify
  the missing runtime evidence rather than claiming those callers already exist.
- Apply the deletion test: would removing the module eliminate complexity, or
  scatter that complexity across callers? A pass-through must earn its place.
- Keep behavior that changes together local. Preserve package and domain
  ownership instead of merging unrelated concerns behind one large interface.
- Prefer existing public interfaces for tests. Observable behavior includes
  failure, retry, authorization, and persistence where applicable.
- Introduce an abstraction seam only when two real adapters exist and tests
  substitute a fake. A proposed future adapter does not justify a seam.

## Compare alternatives

When interface shape materially affects correctness or maintainability, sketch
at least two plausible alternatives before choosing. Compare caller knowledge,
change locality, testability, migration cost, and existing contracts. Small
mechanical changes do not need an alternatives exercise.

Use concrete call examples and state which complexity each option hides or
exposes. Recommend the simplest option supported by current requirements.
Confirmed behavior belongs in the current-truth spec; material unresolved
planning decisions go to Grill or follow the implementation caller's stop rule.
Follow accepted ADRs and report any justified
need to revisit one. Design work does not authorize a refactor outside the request.

## Sources

Adapted from Matt Pocock's [codebase-design](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/codebase-design/SKILL.md).
