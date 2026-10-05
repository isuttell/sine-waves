# Behavioral testing

Load for changes needing regression coverage. Derive test boundaries from the
ticket, public interfaces, and existing tests. Ask only when a missing decision
could change the required proof. Debug owns cause investigation for failures.

## Tests worth keeping

- Test externally observable behavior through public interfaces. Include the
  failure and recovery paths required by the ticket.
- Take expected results from a spec, independently worked example, or known
  literal. Recomputing them with the implementation's algorithm cannot catch
  the same mistake in that algorithm.
- Prefer real internal collaborators. Fake external boundaries only where
  necessary; retain the real driver/provider evidence required by the issue.
- Work one behavior at a time: a meaningful failing test, the smallest passing
  implementation, then the next behavior. Refactor within scope when existing
  behavior remains covered.
- A passing regression test should survive an internal refactor that leaves
  behavior unchanged. Call counts and private-method assertions usually test
  the wrong contract.

Docs, copy, and mechanical changes do not need artificial tests. Follow the
issue's required checks, and still exercise the actual endpoint or UI when
that is the affected user flow. Tests do not replace the configured full gate.

## Sources

Adapted from Matt Pocock's [tdd](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/tdd/SKILL.md).
