# Resumable planning

Use when an effort spans sessions or has more unresolved decisions than one
conversation can handle. Keep the index in the existing authoritative Draft
spec or its established planning index. Do not create a second source of truth.

## Decision index

Record the outcome and scope first. For each material question, record its
prerequisites and one state:

- settled: link the confirmed decision in the spec
- ready to ask: prerequisites are settled
- waiting: name the unresolved prerequisite or research task
- not yet specified: an in-scope concern that cannot yet be phrased precisely
- deferred: name why it does not block slicing

Keep out-of-scope work separate from questions that might become ready later.
Use descriptive names and pointers instead of copying resolved discussions.

At session start, read the outcome, index, and relevant confirmed decisions.
Recheck stale facts, then ask a round of independent ready questions. After the
answers, update the index and surface questions that are now precise enough to
ask. Partial answers leave their dependent questions waiting.

The index is planning context, not a dispatch graph. Grill never creates or
claims tracker tickets. To Issues owns implementation slicing after explicit
readiness approval and passing documentation checks.

## Sources

Adapted from Matt Pocock's [wayfinder](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/wayfinder/SKILL.md), preserving this workflow's local-spec authority and ticket boundary.
