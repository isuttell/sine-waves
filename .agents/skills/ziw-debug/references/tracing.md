# Trace a failure

Use when the failure crosses components or the origin of an invalid value is
unclear. Start at the observed divergence, not every component in the system.

For each suspect boundary, compare the caller's intended input with the
callee's observed input, result, and error. Follow the relevant path backward
until evidence identifies where the valid state becomes invalid. Check schema,
serialization, configuration propagation, transaction boundaries, and error
translation only where the path makes them relevant.

Correlate evidence from the same request or operation with a nonsecret ID.
Different requests, deployments, or timestamps can make healthy components
appear inconsistent. Preserve distinctions between an absent value, an empty
value, a rejected value, and a stale value rather than replacing all with a
default during diagnosis.

Use existing logs and inspection first. Add temporary local instrumentation
only at boundaries needed to distinguish hypotheses. Capture types, lengths,
statuses, and redacted identifiers instead of full payloads. Check credential
presence by exact name and report only set/unset. Never print environment dumps
or execute upstream diagnostic examples without inspecting what they expose.

The throwing line may be enforcing a correct invariant. Removing that guard
does not explain how invalid input arrived. Verify the proposed repair at the
origin and rerun the original entrypoint, including its error path.

## Sources

Adapted from [Superpowers systematic-debugging](https://github.com/obra/superpowers/blob/2c74782ead66b8ded584d9b9cf64dcba95457f320/skills/systematic-debugging/SKILL.md).
