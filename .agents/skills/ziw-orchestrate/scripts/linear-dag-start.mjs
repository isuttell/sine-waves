#!/usr/bin/env node
// Calculate the dependency DAG start for Linear issue snapshots.
//
// Usage:
//   node linear-dag-start.mjs <snapshot-or-issues.json> [--config config.json]
//
// Accepts tick-snapshot output, an envelope with snapshot/state, a direct
// { issues: [...] } object, or a raw issue array.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DEFAULT_DONE_STATES = ["done", "closed", "complete", "completed"];
const DEFAULT_STARTABLE_STATES = ["todo"];
const DEFAULT_STARTABLE_STATE_TYPES = ["unstarted"];
const DEFAULT_READINESS_LABELS = ["ready-for-agent"];
const DEFAULT_STARTABLE_KIND_LABELS = ["kind-slice"];
const TERMINAL_STATE_TYPES = ["completed", "canceled", "duplicate"];
// Raw inputs skip linear-snapshot's canonical lookup, so a duplicate blocker
// keeps blocking until its canonical issue replaces it.
const SATISFIED_BLOCKER_STATE_TYPES = ["completed", "canceled"];
const NON_IMPLEMENTATION_READY_LABELS = new Set([
  "needs-info",
  "needs-triage",
  "ready-for-human",
  "wontfix",
]);
const usage = "Usage: node linear-dag-start.mjs <snapshot-or-issues.json> [--config config.json]";

const toArray = (value) => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const compact = (values) => [
  ...new Set(
    values
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean),
  ),
];

const labelName = (label) => (typeof label === "string" ? label : label?.name);
const issueStateName = (issue) =>
  issue?.state?.name ?? issue?.state ?? issue?.status ?? issue?.workflowState;
const issueStateType = (issue) => issue?.stateType ?? issue?.state?.type;
const issueEstimate = (issue) =>
  issue?.estimate ??
  issue?.estimatePoints ??
  issue?.points ??
  issue?.size ??
  issue?.effort ??
  issue?.bodyEstimate ??
  null;

const issueId = (issue) =>
  String(issue?.identifier ?? issue?.key ?? issue?.id ?? issue?.url ?? "").trim();

const blockerId = (blocker) =>
  String(
    typeof blocker === "string"
      ? blocker
      : (blocker?.identifier ?? blocker?.key ?? blocker?.id ?? blocker?.issue?.identifier ?? ""),
  ).trim();

const blockerStateType = (blocker) =>
  normalize(typeof blocker === "string" ? "" : (blocker?.stateType ?? blocker?.state?.type ?? ""));

const blockerRefs = (issue) =>
  compact(
    [
      ...toArray(issue?.blockedBy),
      ...toArray(issue?.blockers),
      ...toArray(issue?.dependsOn),
      ...toArray(issue?.dependencies),
    ]
      .filter((blocker) => !SATISFIED_BLOCKER_STATE_TYPES.includes(blockerStateType(blocker)))
      .map(blockerId),
  );

const footprintRefs = (issue) =>
  compact([
    ...toArray(issue?.footprint),
    ...toArray(issue?.fileFootprint),
    ...toArray(issue?.files),
    ...toArray(issue?.paths),
    ...toArray(issue?.packages),
  ]);

const requiredEstimateConfigValue = (config = {}) =>
  config.estimateRequired ??
  config.estimatesRequired ??
  config.requireEstimate ??
  config.requireEstimates ??
  config.requiresEstimate ??
  config.requiredEstimate ??
  config.requiredEstimates ??
  config.requiredEstimateBeforeReady ??
  config.estimateRequiredBeforeReady ??
  config.estimatesRequiredBeforeReady ??
  config.requireEstimateBeforeReady ??
  config.requireEstimatesBeforeReady ??
  config.estimate?.requiredBeforeReady ??
  config.estimate?.requiredForReady ??
  config.estimate?.required ??
  config.estimates?.requiredBeforeReady ??
  config.estimates?.requiredForReady ??
  config.estimates?.required ??
  config.estimatePolicy?.requiredBeforeReady ??
  config.estimatePolicy?.requiredForReady ??
  config.estimatePolicy?.required;

const requiresEstimate = (config = {}) => requiredEstimateConfigValue(config) === true;
const hasEstimate = (issue) =>
  issueEstimate(issue) != null && String(issueEstimate(issue)).trim() !== "";

const isDoneIssue = (issue, config = {}) => {
  const doneStates = new Set(
    [...DEFAULT_DONE_STATES, ...toArray(config.doneStates), config.doneState]
      .map(normalize)
      .filter(Boolean),
  );
  const state = normalize(issueStateName(issue));
  const stateType = normalize(issueStateType(issue));
  return doneStates.has(state) || TERMINAL_STATE_TYPES.includes(stateType);
};

const labelsOf = (issue) => toArray(issue?.labels).map((label) => normalize(labelName(label)));

const readinessMatches = (issue, config = {}) => {
  if (issue?.implementationReady || issue?.readyForImplementation) return true;

  const explicitLabels = [
    config.implementationReadyLabel,
    ...toArray(config.implementationReadyLabels),
    config.agentReadinessLabel,
    ...toArray(config.agentReadinessLabels),
  ];
  const usesExplicitLabels = explicitLabels.map(normalize).filter(Boolean).length > 0;
  const candidateLabels = usesExplicitLabels
    ? explicitLabels
    : [config.readinessLabel, ...toArray(config.readinessLabels), ...DEFAULT_READINESS_LABELS];
  const readinessLabels = new Set(
    candidateLabels
      .map(normalize)
      .filter((label) => label && !NON_IMPLEMENTATION_READY_LABELS.has(label)),
  );
  const labels = labelsOf(issue);

  if (readinessLabels.size === 0) return true;
  return labels.some((label) => readinessLabels.has(label));
};

const startableStateMatches = (issue, config = {}) => {
  const configuredStates = [
    config.startableState,
    ...toArray(config.startableStates),
    config.readyState,
    ...toArray(config.readyStates),
  ]
    .map(normalize)
    .filter(Boolean);
  if (configuredStates.length > 0) {
    return configuredStates.includes(normalize(issueStateName(issue)));
  }

  const startableStates = new Set(DEFAULT_STARTABLE_STATES);
  const startableStateTypes = new Set(
    [
      config.startableStateType,
      ...toArray(config.startableStateTypes),
      config.readyStateType,
      ...toArray(config.readyStateTypes),
      ...DEFAULT_STARTABLE_STATE_TYPES,
    ]
      .map(normalize)
      .filter(Boolean),
  );
  return (
    startableStates.has(normalize(issueStateName(issue))) ||
    startableStateTypes.has(normalize(issueStateType(issue)))
  );
};

const startableKindMatches = (issue, config = {}) => {
  const defaultKindLabels =
    config.startableKindLabel == null && config.startableKindLabels == null
      ? DEFAULT_STARTABLE_KIND_LABELS
      : [];
  const kindLabels = new Set(
    [config.startableKindLabel, ...toArray(config.startableKindLabels), ...defaultKindLabels]
      .map(normalize)
      .filter(Boolean),
  );
  const explicitKind = normalize(issue?.kind ?? issue?.kindLabel ?? issue?.kindName);
  const labels = labelsOf(issue);

  if (kindLabels.size === 0) return true;
  return kindLabels.has(explicitKind) || labels.some((label) => kindLabels.has(label));
};

const hasActiveClaim = (issue) => {
  const claim =
    issue?.activeClaim ??
    issue?.claimed ??
    issue?.delegated ??
    issue?.assignedWorker ??
    issue?.workerSession ??
    issue?.agentSession;

  return Boolean(claim);
};

const isOpenPr = (pr) => {
  if (typeof pr === "string") return true;
  const state = normalize(pr?.state ?? pr?.status);
  if (!state) return pr?.open !== false && pr?.closed !== true && pr?.merged !== true;
  return !["closed", "merged"].includes(state);
};

const hasOpenPr = (issue) => {
  if (issue?.openPr || issue?.hasOpenPr || issue?.openPullRequest) return true;
  if (issue?.prOpen) return true;
  if (isOpenPr({ state: issue?.prState, open: issue?.prOpen })) return Boolean(issue?.prState);
  return [
    ...toArray(issue?.openPrs),
    ...toArray(issue?.openPullRequests),
    ...toArray(issue?.pullRequests),
    ...toArray(issue?.prs),
  ].some(isOpenPr);
};

const startableBlockers = (node) =>
  [
    !node.unblocked && "blocked by dependency",
    !node.startableState && "not in configured startable state",
    !node.ready && "missing readiness label",
    !node.startableKind && "not kind-slice",
    node.requiresEstimate && !node.hasEstimate && "missing required estimate",
    node.activeClaim && "active claim exists",
    node.openPr && "open PR exists",
  ].filter(Boolean);

const isStartableNode = (node) => startableBlockers(node).length === 0;

export function extractLinearIssues(input = {}) {
  if (Array.isArray(input)) return input;
  const linear = input.linear ?? input.snapshot?.linear;
  if (linear?.issues != null || linear?.activeIssues != null) {
    const byId = new Map();
    for (const issue of [...toArray(linear.issues), ...toArray(linear.activeIssues)]) {
      const id = normalize(issueId(issue));
      if (id && !byId.has(id)) byId.set(id, issue);
    }
    return [...byId.values()];
  }
  return input.state?.tickets ?? input.queue?.tickets ?? input.issues ?? input.nodes ?? [];
}

export function linearDagStart(issuesInput = [], config = {}) {
  const issues = toArray(issuesInput).filter(
    (issue) => issueId(issue) && !isDoneIssue(issue, config),
  );
  const idByKey = new Map();
  const order = new Map();

  issues.forEach((issue, index) => {
    const id = issueId(issue);
    idByKey.set(normalize(id), id);
    order.set(id, index);
  });

  const nodes = new Map();
  for (const issue of issues) {
    const id = issueId(issue);
    const blockedBy = blockerRefs(issue);
    const inScopeBlockedBy = [];
    const externalBlockedBy = [];

    for (const blocker of blockedBy) {
      const inScopeId = idByKey.get(normalize(blocker));
      if (inScopeId) inScopeBlockedBy.push(inScopeId);
      else externalBlockedBy.push(blocker);
    }

    const startableKind = startableKindMatches(issue, config);
    const estimate = issueEstimate(issue);
    nodes.set(id, {
      id,
      title: issue.title ?? null,
      url: issue.url ?? null,
      state: issueStateName(issue) ?? null,
      stateType: issue.stateType ?? issue.state?.type ?? null,
      estimate,
      hasEstimate: hasEstimate(issue),
      requiresEstimate: requiresEstimate(config) && startableKind,
      labels: toArray(issue.labels).map(labelName).filter(Boolean),
      footprint: footprintRefs(issue),
      blockedBy,
      inScopeBlockedBy: compact(inScopeBlockedBy),
      externalBlockedBy: compact(externalBlockedBy),
      blocks: [],
      root: false,
      unblocked: false,
      ready: readinessMatches(issue, config),
      startableState: startableStateMatches(issue, config),
      startableKind,
      activeClaim: hasActiveClaim(issue),
      openPr: hasOpenPr(issue),
      startable: false,
      startableBlockers: [],
      layer: null,
    });
  }

  for (const node of nodes.values()) {
    for (const blocker of node.inScopeBlockedBy) {
      nodes.get(blocker)?.blocks.push(node.id);
    }
  }

  for (const node of nodes.values()) {
    node.blocks = compact(node.blocks).sort((a, b) => order.get(a) - order.get(b));
    node.root = node.inScopeBlockedBy.length === 0;
    node.unblocked = node.root && node.externalBlockedBy.length === 0;
    node.startableBlockers = startableBlockers(node);
    node.startable = isStartableNode(node);
  }

  const indegree = new Map(
    [...nodes.values()].map((node) => [node.id, node.inScopeBlockedBy.length]),
  );
  let queue = [...nodes.values()]
    .filter((node) => node.inScopeBlockedBy.length === 0)
    .map((node) => node.id)
    .sort((a, b) => order.get(a) - order.get(b));
  const layers = [];
  let layerIndex = 0;

  while (queue.length > 0) {
    layers.push(queue);
    const next = [];
    for (const id of queue) {
      nodes.get(id).layer = layerIndex;
      for (const child of nodes.get(id).blocks) {
        indegree.set(child, indegree.get(child) - 1);
        if (indegree.get(child) === 0) next.push(child);
      }
    }
    queue = compact(next).sort((a, b) => order.get(a) - order.get(b));
    layerIndex += 1;
  }

  const cycles = [...nodes.values()]
    .filter((node) => indegree.get(node.id) > 0)
    .map((node) => node.id);
  const roots = [...nodes.values()].filter((node) => node.root).map((node) => node.id);
  const frontier = [...nodes.values()].filter((node) => node.unblocked).map((node) => node.id);
  const starts = [...nodes.values()].filter((node) => node.startable).map((node) => node.id);
  const readyStarts = [...nodes.values()]
    .filter((node) => node.unblocked && node.ready && node.startableState)
    .map((node) => node.id);

  const outOfScopeBlockers = [...nodes.values()].flatMap((node) =>
    node.externalBlockedBy.map((blocker) => ({ ticket: node.id, blocker })),
  );

  return {
    totalIssues: nodes.size,
    roots,
    frontier,
    starts,
    readyStarts,
    layers,
    cycles,
    outOfScopeBlockers,
    // Backward-compatible alias. These relations exist in Linear; the blocker
    // ticket is merely outside this bounded snapshot.
    missingBlockers: outOfScopeBlockers,
    missingEstimates: [...nodes.values()]
      .filter((node) => node.requiresEstimate && !node.hasEstimate)
      .map((node) => ({ ticket: node.id })),
    nodes: [...nodes.values()],
  };
}

const readJson = (source, label) => {
  if (!source) return {};
  try {
    const text = source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8");
    return text.trim() ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`linear-dag-start: cannot read ${label}: ${error.message}`);
    process.exit(1);
  }
};

const main = () => {
  const args = process.argv.slice(2);
  const argValue = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const positional = args.filter(
    (arg, index) => !arg.startsWith("--") && args[index - 1] !== "--config",
  );

  if (positional.length !== 1) {
    console.error(`linear-dag-start: expected exactly one input\n${usage}`);
    process.exit(1);
  }

  const input = readJson(positional[0], "input");
  const config = { ...(input.config ?? {}), ...readJson(argValue("--config"), "--config") };
  const result = linearDagStart(extractLinearIssues(input), config);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
