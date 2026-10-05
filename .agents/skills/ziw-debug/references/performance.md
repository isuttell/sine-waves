# Performance investigation

Use for a reported latency, throughput, CPU, memory, or resource regression.

Define the reported metric, workload, environment, and comparison baseline.
Measure before editing. Include warmup, cache state, input size, concurrency,
and sample variation where they materially affect the result. A benchmark with
a different workload does not reproduce the user's regression.

Use existing tracing or a focused local profile to identify where the cost is
incurred. Distinguish waiting from computation, application heap limits from
kernel OOM, and load effects from the changed code. Choose one intervention
whose predicted effect would distinguish the leading explanation.

Compare before and after under the same controlled workload. Verify correctness
and the original end-to-end metric, not just a faster isolated function. Report
the measured change and uncertainty; do not promise a speedup from inspection.
Keep expensive benchmarks bounded and respect configured concurrency limits.

New production profiling, traffic generation, instrumentation, and resource-policy
changes require their applicable authorization. Missing measurements mean a
hypothesis and a named evidence gap, not a verified performance fix.

## Sources

Adapted from Matt Pocock's [diagnosing-bugs](https://github.com/mattpocock/skills/blob/24fe0ef7737efae15c87225755e9f6f5965e4888/skills/engineering/diagnosing-bugs/SKILL.md).
