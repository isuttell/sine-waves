# Intermittent failures

Use for timing, concurrency, retries, or failures that do not reproduce on every run.

Record the failing and total runs, environment, inputs, and relevant ordering.
Identify prior speculative changes still applied and whether they mask the
symptom; isolate their effects without discarding unrelated work.
Choose a bounded run count or time budget that can distinguish the current
hypothesis; do not run an open-ended stress loop. A clean sample does not prove
an intermittent failure is gone.

Control one source of variation at a time: seed, worker count, clock, request
ordering, or dependency response. Prefer a barrier, fake clock, recorded seed,
or controlled boundary that forces the suspect ordering over arbitrary sleeps.
Preserve real integration evidence when the failure depends on an actual driver
or provider. A fake that removes the race cannot validate its repair.

When waiting for asynchronous work, observe the relevant completion condition
with a timeout and report the last state on failure. Increasing a delay or retry
limit alone may hide the symptom. Establish why the operation should eventually
complete and whether retries are safe before proposing that repair.

After a fix, run the forced failing ordering and the original bounded sample.
Report both results and the remaining uncertainty; statistical evidence is not
a deterministic guarantee. All experiments remain within the caller's authority.

## Sources

Adapted from [Superpowers systematic-debugging](https://github.com/obra/superpowers/blob/2c74782ead66b8ded584d9b9cf64dcba95457f320/skills/systematic-debugging/SKILL.md).
