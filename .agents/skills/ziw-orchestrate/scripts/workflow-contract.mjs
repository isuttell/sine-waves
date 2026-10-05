// Keep deterministic orchestration decisions inside the published skill so its
// scripts remain runnable after project-scoped installation.
const DEFAULT_DONE_STATES = ["done", "closed", "complete", "completed"];
const DEFAULT_READY_STATES = ["todo"];
const DEFAULT_READINESS_LABELS = ["ready-for-agent", "ready-for-human"];
const DEFAULT_IMPLEMENTATION_READY_LABELS = ["ready-for-agent"];
const DEFAULT_HUMAN_MERGE_PR_LABEL = "needs-human-merge";
const DEFAULT_READY_PROMOTION_SOURCE_STATES = ["triage", "intake"];
const TERMINAL_PR_STATES = ["closed", "merged"];
const INACTIVE_PREVIEW_STATES = ["inactive", "deleted", "closed", "failed"];
const NON_IMPLEMENTATION_READY_LABELS = new Set([
  "needs-info",
  "needs-triage",
  "ready-for-human",
  "wontfix",
]);
const REVISION_REVIEW_VERDICTS = new Set(["needs revision", "do not merge"]);
const CLEAN_REVIEW_VERDICTS = [
  "approve",
  "approved",
  "ready for pr",
  "ready to merge",
  "ready_to_merge",
];

const TRUSTED_POLICY_SOURCES = new Set([
  "agent_adapter",
  "repo_config",
  "system",
  "user_request",
  "workflow_skill",
]);

const UNTRUSTED_OVERRIDE_PATTERNS = [
  /\bignore\b.*\b(instruction|policy|workflow|system|developer)\b/i,
  /\b(skip|bypass|disable)\b.*\b(test|check|review|hook|secret scan|gitleaks)\b/i,
  /\b(push|commit|merge|deploy)\b.*\b(main|master|production)\b/i,
  /\b(print|exfiltrate|upload|send)\b.*\b(secret|token|key|credential)\b/i,
];

const toArray = (value) => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const firstDefined = (...values) => values.find((value) => value != null);

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const labelName = (label) => normalize(typeof label === "string" ? label : label?.name);

const shaEquals = (left, right) => Boolean(left && right && normalize(left) === normalize(right));

const fingerprintEquals = (left, right) =>
  Boolean(left && right && normalize(left) === normalize(right));

const currentReviewDiffFingerprint = (state = {}) =>
  firstDefined(
    state.currentReviewDiffFingerprint,
    state.reviewDiffFingerprint,
    state.reviewRelevantDiffFingerprint,
  );

const reviewedDiffFingerprint = (state = {}) =>
  firstDefined(state.reviewedDiffFingerprint, state.reviewedReviewDiffFingerprint);

const reviewCoversCurrentDiff = (state = {}) =>
  fingerprintEquals(reviewedDiffFingerprint(state), currentReviewDiffFingerprint(state));

const hostedReviewCoversCurrentDiff = (state = {}) =>
  fingerprintEquals(
    state.hostedReviewDiffFingerprint ?? state.hostedReviewedDiffFingerprint,
    currentReviewDiffFingerprint(state),
  );

const valueSet = (values) => new Set(toArray(values).map(normalize).filter(Boolean));

function isDependencyBotPr(pr = {}) {
  if (pr.isDependencyBot === true || pr.dependencyBot === true) return true;
  const author = normalize(pr.author ?? pr.authorLogin ?? pr.user ?? pr.login);
  return author.includes("dependabot") || author.includes("renovate");
}

export const workflowDecisionActions = Object.freeze({
  applyHumanMergePrLabel: "APPLY_HUMAN_MERGE_PR_LABEL",
  applyReviewEvidence: "APPLY_REVIEW_EVIDENCE",
  armAutoMerge: "ARM_AUTO_MERGE",
  clearHumanMergePrLabel: "CLEAR_HUMAN_MERGE_PR_LABEL",
  clearReviewEvidence: "CLEAR_REVIEW_EVIDENCE",
  deferForFileContention: "DEFER_FOR_FILE_CONTENTION",
  dispatchStartableWork: "DISPATCH_STARTABLE_WORK",
  deferUntilPrReady: "DEFER_UNTIL_PR_READY",
  holdMerge: "HOLD_MERGE",
  hostedReviewComplete: "RECORD_HOSTED_REVIEW_COMPLETE",
  hostedReviewPending: "RECORD_HOSTED_REVIEW_PENDING",
  ignoreUntrustedOverride: "IGNORE_AND_RECORD_SECURITY_FINDING",
  leaveUnchanged: "LEAVE_UNCHANGED",
  promoteToReadyState: "PROMOTE_TO_READY_STATE",
  requestFileFootprint: "REQUEST_FILE_FOOTPRINT",
  requestPrReview: "REQUEST_PR_REVIEW",
  resolveAutoReviewState: "RESOLVE_AUTO_REVIEW_STATE",
  routeHumanMerge: "ROUTE_HUMAN_MERGE",
  runLocalCli: "RUN_LOCAL_CLI",
  stopBudgetExhausted: "STOP_BUDGET_EXHAUSTED",
  stopBlocked: "STOP_COMPLETELY_BLOCKED",
  treatAsWorkContext: "TREAT_AS_WORK_CONTEXT",
  waitForSignal: "WAIT_FOR_EXTERNAL_SIGNAL",
});

export function isDoneTicket(ticket, config = {}) {
  const doneStates = valueSet([
    ...DEFAULT_DONE_STATES,
    ...toArray(config.doneStates),
    config.doneState,
  ]);
  return doneStates.has(normalize(ticket?.state ?? ticket?.status ?? ticket?.workflowState));
}

export function hasReadinessLabel(ticket, config = {}) {
  const readinessLabels = valueSet([
    ...DEFAULT_READINESS_LABELS,
    ...toArray(config.readinessLabels),
    config.readinessLabel,
  ]);
  return toArray(ticket?.labels).some((label) => readinessLabels.has(labelName(label)));
}

function implementationReadyLabels(config = {}) {
  const explicitLabels = [
    config.implementationReadyLabel,
    ...toArray(config.implementationReadyLabels),
    config.agentReadinessLabel,
    ...toArray(config.agentReadinessLabels),
  ];
  const candidateLabels =
    explicitLabels.map(normalize).filter(Boolean).length > 0
      ? explicitLabels
      : [
          ...DEFAULT_IMPLEMENTATION_READY_LABELS,
          config.readinessLabel,
          ...toArray(config.readinessLabels),
        ];

  return new Set(
    candidateLabels
      .map(normalize)
      .filter((label) => label && !NON_IMPLEMENTATION_READY_LABELS.has(label)),
  );
}

function hasImplementationReadyLabel(ticket, config = {}) {
  const labels = implementationReadyLabels(config);
  return toArray(ticket?.labels).some((label) => labels.has(labelName(label)));
}

export function shouldIncludeReadinessTicket(ticket, config = {}) {
  return hasReadinessLabel(ticket, config) && !isDoneTicket(ticket, config);
}

function isKindSlice(ticket) {
  const explicitKind = normalize(ticket?.kind ?? ticket?.kindLabel ?? ticket?.kindName);
  if (explicitKind === "kind-slice") return true;
  return toArray(ticket?.labels).some((label) => labelName(label) === "kind-slice");
}

export function readyStatePromotionDecision(ticket, config = {}, options = {}) {
  const readyState = config.readyState ?? "Todo";
  const readyStates = valueSet([readyState, ...toArray(config.readyStates)]);
  const linearBacklogStates = valueSet([
    "backlog",
    config.linearBacklogState,
    ...toArray(config.linearBacklogStates),
  ]);
  const sourceStates = valueSet([
    ...DEFAULT_READY_PROMOTION_SOURCE_STATES,
    ...toArray(config.readyPromotionSourceStates),
    ...toArray(config.intakeStates),
    config.intakeState,
  ]);
  const state = normalize(ticket?.state ?? ticket?.status ?? ticket?.workflowState);
  const requestedReadyStatePromotion =
    options.requestedReadyStatePromotion ?? config.requestedReadyStatePromotion;
  const requestedLinearBacklogReview = Boolean(
    options.requestedLinearBacklogReview ?? config.requestedLinearBacklogReview,
  );
  const implementationReady = Boolean(
    firstDefined(
      ticket?.implementationReady,
      ticket?.readyForImplementation,
      isKindSlice(ticket) && hasImplementationReadyLabel(ticket, config),
    ),
  );

  if (!implementationReady) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "ticket is not implementation-ready",
    };
  }

  if (isDoneTicket(ticket, config)) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "done tickets are terminal, not ready-state candidates",
    };
  }

  if (readyStates.has(state)) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "ticket is already in the configured ready state",
    };
  }

  if (!sourceStates.has(state)) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "ticket is not in a configured ready-state promotion source state",
    };
  }

  if (requestedReadyStatePromotion === false) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "ready-state promotion was explicitly disabled",
    };
  }

  if (linearBacklogStates.has(state) && !requestedLinearBacklogReview) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "Linear Backlog promotion requires requested Linear Backlog review",
    };
  }

  return {
    action: workflowDecisionActions.promoteToReadyState,
    targetState: readyState,
    reason:
      "implementation-ready work belongs in the ready state; dependency blockers are encoded separately",
  };
}

function hasBlockingReview(state) {
  return (
    Boolean(state.blockingFindings) ||
    Boolean(state.changesRequested) ||
    normalize(state.reviewDecision) === "changes_requested"
  );
}

export function reviewEvidenceDecision(evidence = {}) {
  const hasEvidence = Boolean(evidence.hasReviewEvidence ?? evidence.evidenceLabel);
  const cleanVerdict = valueSet(CLEAN_REVIEW_VERDICTS).has(normalize(evidence.reviewVerdict));

  if (!hasEvidence) {
    if (
      cleanVerdict &&
      reviewCoversCurrentDiff(evidence) &&
      !hasBlockingReview(evidence) &&
      !evidence.linkedPrChanged &&
      !evidence.evidenceMissing
    ) {
      return {
        action: workflowDecisionActions.applyReviewEvidence,
        reason: "clean review covers the current review-relevant diff",
      };
    }

    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: "no current review evidence to apply or clear",
    };
  }

  if (hasBlockingReview(evidence)) {
    return {
      action: workflowDecisionActions.clearReviewEvidence,
      reason: "blocking findings invalidate review evidence",
    };
  }

  if (evidence.linkedPrChanged || evidence.evidenceMissing) {
    return {
      action: workflowDecisionActions.clearReviewEvidence,
      reason: "linked PR or review evidence no longer matches the ticket",
    };
  }

  if (!reviewCoversCurrentDiff(evidence)) {
    return {
      action: workflowDecisionActions.clearReviewEvidence,
      reason: "review-relevant diff changed since review",
    };
  }

  return {
    action: workflowDecisionActions.leaveUnchanged,
    reason: "review evidence is current",
  };
}

const hasNamedLabel = (labels, name) =>
  Boolean(name) && toArray(labels).some((label) => labelName(label) === normalize(name));

function currentReviewEvidence(state = {}) {
  const cleanVerdict = valueSet(CLEAN_REVIEW_VERDICTS).has(
    normalize(state.reviewVerdict ?? state.codeReviewVerdict),
  );
  const hasEvidence = Boolean(
    firstDefined(
      state.reviewEvidenceCurrent,
      state.hasReviewEvidence,
      state.reviewEvidenceLabel,
      state.evidenceLabel,
    ),
  );

  return (
    state.reviewEvidenceCurrent === true ||
    (hasEvidence && cleanVerdict && reviewCoversCurrentDiff(state))
  );
}

function countEvidence(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  return value ? 1 : 0;
}

function requiredChecksPassed(state = {}) {
  return Boolean(
    firstDefined(
      state.requiredChecksPassed,
      state.requiredChecksGreen,
      state.checksPassing,
      state.checksGreen,
      state.ciGreen,
    ),
  );
}

const AGENT_MERGE_AUTHORITIES = ["agent", "auto", "automated", "orchestrator"];

function resolvedDeliveryMode(config = {}) {
  return normalize(config.deliveryMode) === "velocity" ? "velocity" : "production";
}

function grantedAutoMergeTiers(config = {}) {
  return valueSet(
    config.autoMergeRiskTiers != null
      ? config.autoMergeRiskTiers
      : resolvedDeliveryMode(config) === "velocity"
        ? RISK_TIERS
        : ["low", "medium"],
  );
}

function mergeReadinessFacts(state = {}) {
  const prState = normalize(state.prState ?? state.state ?? state.status);
  const terminal =
    state.merged === true || state.closed === true || TERMINAL_PR_STATES.includes(prState);
  const hostedReviewRequired = state.hostedReviewRequired || state.codeRabbitRequired;
  const hostedReviewComplete = state.hostedReviewComplete || state.codeRabbitComplete;
  const hostedReviewSkipped = state.hostedReviewSkipped || state.codeRabbitSkipped;
  return {
    blockingFindings: hasBlockingReview(state),
    checksPassed: requiredChecksPassed(state),
    draft:
      state.draft === true ||
      state.isDraft === true ||
      prState === "draft" ||
      normalize(state.draftState) === "draft",
    hostedReviewBlocked: Boolean(
      hostedReviewRequired &&
      !hostedReviewSkipped &&
      !(hostedReviewComplete && hostedReviewCoversCurrentDiff(state)),
    ),
    open: Boolean((state.open ?? !terminal) && !terminal),
    reviewEvidenceCurrent: currentReviewEvidence(state),
    scopeMismatch: state.scopeMatches === false || state.diffMatchesScope === false,
    unresolvedReviewThreads: countEvidence(
      state.unresolvedReviewThreads ?? state.unresolvedThreads,
    ),
  };
}

export function humanMergePrLabelDecision(state = {}, config = {}) {
  const label =
    state.humanMergePrLabel ??
    state.humanReviewPrLabel ??
    config.humanMergePrLabel ??
    config.humanReviewPrLabel ??
    config.codeHostHumanMergePrLabel ??
    config.codeHostHumanMergeLabel ??
    config.codeHostHumanReviewPrLabel ??
    config.codeHostHumanReviewLabel ??
    config.codeHostPrAttentionLabel ??
    DEFAULT_HUMAN_MERGE_PR_LABEL;
  const prLabels = [
    ...toArray(state.prLabels),
    ...toArray(state.pullRequestLabels),
    ...toArray(state.labels),
  ];
  const labelApplied = Boolean(
    firstDefined(
      state.humanMergePrLabelApplied,
      state.humanReviewPrLabelApplied,
      state.hasHumanMergePrLabel,
      state.hasHumanReviewPrLabel,
      hasNamedLabel(prLabels, label),
    ),
  );
  const facts = mergeReadinessFacts(state);
  const mergeDecision = mergeEligibilityDecision(state, config);

  const invalidReason = !label
    ? "no human-merge PR label is configured"
    : !facts.open
      ? "PR is not open"
      : facts.draft
        ? "draft PRs are pre-review and cannot be marked ready for human merge"
        : mergeDecision.action === workflowDecisionActions.holdMerge
          ? mergeDecision.reason
          : mergeDecision.action !== workflowDecisionActions.routeHumanMerge
            ? "configured merge authority does not require human merge"
            : "";

  if (invalidReason) {
    return {
      action: labelApplied
        ? workflowDecisionActions.clearHumanMergePrLabel
        : workflowDecisionActions.leaveUnchanged,
      label,
      reason: invalidReason,
    };
  }

  if (!labelApplied) {
    return {
      action: workflowDecisionActions.applyHumanMergePrLabel,
      label,
      reason: "PR is merge-ready except for required human merge authority",
    };
  }

  return {
    action: workflowDecisionActions.leaveUnchanged,
    label,
    reason: "human-merge PR label is current",
  };
}

const DEFAULT_HIGH_RISK_LABELS = ["risk-security-sensitive", "risk-schema", "risk-cross-cutting"];
const RISK_TIERS = ["low", "medium", "high"];
const CONFORMANCE_PASS = "pass";
const CONFORMANCE_FAIL = new Set(["fail", "failed"]);

export function riskTier(state = {}, config = {}) {
  const labels = [
    ...toArray(state.labels),
    ...toArray(state.issueLabels),
    ...toArray(state.prLabels),
    ...toArray(state.riskLabels),
  ];
  const highRiskLabels = valueSet([...DEFAULT_HIGH_RISK_LABELS, ...toArray(config.highRiskLabels)]);
  const lowRiskLabels = valueSet(toArray(config.lowRiskLabels));
  const hasHighLabel = labels.some((label) => highRiskLabels.has(labelName(label)));
  const labelTier = hasHighLabel
    ? "high"
    : labels.some((label) => lowRiskLabels.has(labelName(label)))
      ? "low"
      : "medium";

  const explicit = normalize(state.riskTier ?? state.tier);
  if (!RISK_TIERS.includes(explicit)) return labelTier;
  // High-risk labels are a floor: state-sourced tier fields cannot downgrade them.
  if (hasHighLabel) return "high";
  return explicit;
}

export function reviewDepthRequirement(tier, config = {}) {
  const normalizedTier = RISK_TIERS.includes(normalize(tier)) ? normalize(tier) : "medium";
  const configured = config.requiredIndependentReviews;
  const independentReviews = Number(
    typeof configured === "object" ? (configured?.[normalizedTier] ?? 1) : (configured ?? 1),
  );
  if (!Number.isInteger(independentReviews) || independentReviews < 1) {
    throw new Error("required independent reviews must be a positive integer");
  }
  return {
    independentReviews,
    secondPassOnUncertainty: Boolean(config.secondReviewOnUncertainty),
    strongestModel: normalizedTier === "high",
    tier: normalizedTier,
  };
}

function independentReviewCount(state = {}) {
  const explicit = state.independentReviewCount ?? state.independentReviews;
  let count = countEvidence(explicit);
  if (count === 0 && currentReviewEvidence(state)) count = 1;
  // Fail closed: a hosted review counts only when its recorded diff fingerprint
  // provably matches the current review-relevant diff.
  if (state.hostedReviewComplete && hostedReviewCoversCurrentDiff(state)) count += 1;
  return count;
}

export function mergeEligibilityDecision(state = {}, config = {}) {
  const tier = riskTier(state, config);
  // Delivery mode is repo policy: config-owned, never read from runtime state.
  const mode = resolvedDeliveryMode(config);
  const reviewDepth = reviewDepthRequirement(tier, config);
  const base = { mode, reviewDepth, tier };

  const hold = (reason) => ({ ...base, action: workflowDecisionActions.holdMerge, reason });
  const routeHuman = (reason) => ({
    ...base,
    action: workflowDecisionActions.routeHumanMerge,
    reason,
  });

  const facts = mergeReadinessFacts(state);
  const conformance = normalize(state.conformance ?? state.conformanceVerdict);
  const currentHead = state.currentPrHeadSha ?? state.headSha;
  const conformanceCoversHead =
    state.conformanceHeadSha == null || shaEquals(state.conformanceHeadSha, currentHead);
  if (!facts.open) return hold("PR is not open");
  if (facts.draft) return hold("draft PRs are pre-review and cannot merge");
  // Findings from a review of the current diff need a fix, not another review.
  if (state.reviewEvidenceCurrent === true || reviewCoversCurrentDiff(state)) {
    const verdict = normalize(state.reviewVerdict ?? state.codeReviewVerdict);
    if (facts.blockingFindings || REVISION_REVIEW_VERDICTS.has(verdict)) {
      return hold("blocking findings or changes requested remain");
    }
    if (CONFORMANCE_FAIL.has(conformance) && conformanceCoversHead) {
      return hold("conformance table has FAIL rows; route findings back to the worker");
    }
  }
  if (!facts.reviewEvidenceCurrent) {
    return hold("current review-relevant diff lacks clean code review evidence");
  }
  if (!facts.checksPassed) return hold("required checks are not confirmed passing");
  if (facts.unresolvedReviewThreads > 0) return hold("unresolved review threads remain");
  if (facts.hostedReviewBlocked) return hold("required hosted review is pending or incomplete");
  if (facts.scopeMismatch) return hold("diff does not match the linked issue scope");

  // Trust boundary: state is orchestrator-assembled from freshly refreshed
  // systems of record, so first-party boolean evidence (reviewEvidenceCurrent,
  // a conformance verdict without conformanceHeadSha) is trusted as-is.
  // Third-party reviews require a matching review-diff fingerprint.
  const requireConformance = config.requireConformanceEvidence === true;
  if (conformance && !conformanceCoversHead) {
    return hold("conformance evidence does not cover the current PR head");
  }
  if (requireConformance) {
    if (!conformance) {
      return hold("conformance table is not exhibited for the current PR head");
    }
    if (conformance !== CONFORMANCE_PASS && tier === "high") {
      return hold(
        "high-risk work requires exhibited PASS conformance; unverifiable rows are an intake gap",
      );
    }
  }

  if (independentReviewCount(state) < reviewDepth.independentReviews) {
    return hold("review depth for this risk tier requires another independent review pass");
  }

  // The PR is merge-ready; from here only authority decides the route.
  if (state.productionAction === true || state.humanDecisionPending === true) {
    return routeHuman("production actions and unresolved human decisions never auto-merge");
  }
  const configuredAuthority = normalize(config.mergeAuthority);
  if (!configuredAuthority) {
    return routeHuman("merge authority is not configured; missing policy never grants auto-merge");
  }
  if (!AGENT_MERGE_AUTHORITIES.includes(configuredAuthority)) {
    return routeHuman("configured merge authority requires human merge");
  }

  if (!grantedAutoMergeTiers(config).has(tier)) {
    return routeHuman(`${mode} mode routes ${tier}-risk merges to human authority`);
  }

  const conformanceNote =
    conformance && conformance !== CONFORMANCE_PASS
      ? "; conformance not fully verifiable, recorded as intake gap"
      : "";
  return {
    ...base,
    action: workflowDecisionActions.armAutoMerge,
    reason: `merge-ready at ${tier} risk in ${mode} mode${conformanceNote}`,
  };
}

export function activeDeliveryFootprint(state = {}) {
  const openPrs = toArray(state.pullRequests).filter(
    (pr) =>
      pr?.open !== false &&
      !isDependencyBotPr(pr) &&
      !TERMINAL_PR_STATES.includes(normalize(pr?.state ?? pr?.status)),
  );
  const prKeys = new Set(
    openPrs
      .flatMap((pr) => [pr.id, pr.url, pr.number, pr.prId])
      .map(normalize)
      .filter(Boolean),
  );

  const activePreviews = toArray(state.previews).filter((preview) => {
    if (preview?.active === false) return false;
    return !INACTIVE_PREVIEW_STATES.includes(normalize(preview?.state ?? preview?.status));
  });
  const unlinkedPreviews = activePreviews.filter((preview) => {
    const previewPrKeys = [preview.prId, preview.prUrl, preview.prNumber]
      .map(normalize)
      .filter(Boolean);
    return previewPrKeys.length === 0 || previewPrKeys.every((key) => !prKeys.has(key));
  });

  const pendingDispatches = toArray(state.dispatches).filter(
    (dispatch) =>
      dispatch?.returned !== true &&
      dispatch?.stopped !== true &&
      dispatch?.hasPr !== true &&
      !["returned", "stopped", "failed"].includes(normalize(dispatch?.state ?? dispatch?.status)),
  );

  return {
    dispatches: pendingDispatches.length,
    previews: unlinkedPreviews.length,
    prs: openPrs.length,
    total: openPrs.length + unlinkedPreviews.length + pendingDispatches.length,
  };
}

function workerConcurrencyCap(config = {}) {
  const cap = Number(config.workerConcurrencyCap ?? config.cap ?? 3);
  if (!Number.isInteger(cap) || cap < 0) {
    throw new Error("worker concurrency cap must be a non-negative integer");
  }
  return cap;
}

function isActiveWorker(worker = {}) {
  if (worker.occupiesWorkerSlot === false) return false;
  if (worker.returned === true || worker.stopped === true || worker.hasPr === true) return false;
  return !["completed", "failed", "returned", "stale", "stopped"].includes(
    normalize(worker.state ?? worker.status),
  );
}

export function activeWorkerCapacity(state = {}, config = {}) {
  const cap = workerConcurrencyCap(config);
  const workers = [...toArray(state.workers), ...toArray(state.dispatches)].filter(isActiveWorker);
  const identities = new Set(
    workers.map((worker, index) =>
      normalize(
        worker.session ??
          worker.sessionId ??
          worker.issueId ??
          worker.ticket ??
          worker.id ??
          `worker-${index}`,
      ),
    ),
  );
  const used = identities.size;
  return { cap, headroom: Math.max(0, cap - used), used };
}

export function capacityDecision(state = {}, config = {}) {
  const capacity = activeWorkerCapacity(state, config);
  const startableCount = toArray(state.startableTickets).length;
  const activeSignalExpected = Boolean(state.activeSignalExpected);

  if (capacity.headroom === 0) {
    return {
      action: workflowDecisionActions.waitForSignal,
      capacity,
      reason: "all configured worker slots are occupied",
    };
  }

  if (startableCount > 0) {
    return {
      action: workflowDecisionActions.dispatchStartableWork,
      capacity,
      reason: "worker slots are available and startable work exists",
    };
  }

  if (capacity.used > 0 || activeSignalExpected) {
    return {
      action: workflowDecisionActions.waitForSignal,
      capacity,
      reason: "external worker, check, preview, or review signal may still arrive",
    };
  }

  return {
    action: workflowDecisionActions.stopBlocked,
    capacity,
    reason: "no startable work, active work, or expected external signal remains",
  };
}

function normalizeFootprintPath(value) {
  return normalize(value)
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/\*{1,2}$/, "")
    .replace(/\/+$/, "");
}

function footprintEntries(item = {}) {
  return [
    ...toArray(item.footprint),
    ...toArray(item.fileFootprint),
    ...toArray(item.files),
    ...toArray(item.paths),
    ...toArray(item.packages),
    ...toArray(item.changedFiles),
  ]
    .map(normalizeFootprintPath)
    .filter(Boolean);
}

function footprintsConflict(leftEntries, rightEntries) {
  return leftEntries.some((left) =>
    rightEntries.some(
      (right) => left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`),
    ),
  );
}

function activeFootprintItems(state = {}) {
  const activePrs = toArray(state.pullRequests).filter(
    (pr) => pr?.open !== false && !TERMINAL_PR_STATES.includes(normalize(pr?.state ?? pr?.status)),
  );
  const activeDispatches = toArray(state.dispatches).filter(
    (dispatch) =>
      dispatch?.returned !== true &&
      dispatch?.stopped !== true &&
      dispatch?.hasPr !== true &&
      !["returned", "stopped", "failed"].includes(normalize(dispatch?.state ?? dispatch?.status)),
  );

  return [...toArray(state.activeWork).filter(isActiveWorker), ...activePrs, ...activeDispatches];
}

function configuredWorkerNames(config = {}, kind) {
  const defaults =
    kind === "remote" ? ["remote", "remote-cursor", "cursor"] : ["local", "local-codex", "codex"];
  return valueSet([
    ...defaults,
    config[`${kind}WorkerPath`],
    ...toArray(config[`${kind}WorkerPaths`]),
  ]);
}

function eligibleWorkerKinds(ticket = {}, config = {}) {
  const workers = toArray(
    ticket.eligibleWorkers ?? ticket.workerPaths ?? ticket.allowedWorkers ?? ticket.workers,
  )
    .map(normalize)
    .filter(Boolean);
  if (workers.length === 0) return null;

  const remoteNames = configuredWorkerNames(config, "remote");
  const localNames = configuredWorkerNames(config, "local");
  return [
    ...(workers.some((worker) => remoteNames.has(worker)) ? ["remote"] : []),
    ...(workers.some((worker) => localNames.has(worker)) ? ["local"] : []),
  ];
}

function ticketLeverage(ticket = {}) {
  const explicit = Number(ticket.unlockCount ?? ticket.downstreamCount);
  if (Number.isFinite(explicit)) return explicit;
  return toArray(ticket.blocks ?? ticket.dependents).length;
}

function ticketPriority(ticket = {}) {
  const priority = Number(ticket.priority ?? ticket.objectiveRank);
  return Number.isFinite(priority) && priority > 0 ? priority : Number.POSITIVE_INFINITY;
}

function localBudgetPolicy(state = {}, config = {}) {
  const usage = Number(state.localBudgetUsagePercent);
  if (!Number.isFinite(usage)) return { mode: "unconfigured" };

  if (config.localBudgetSoftStopPercent == null || config.localBudgetHardStopPercent == null) {
    return { mode: "unconfigured", usage };
  }
  const softStop = Number(config.localBudgetSoftStopPercent);
  const hardStop = Number(config.localBudgetHardStopPercent);
  if (!Number.isFinite(softStop) || !Number.isFinite(hardStop) || softStop > hardStop) {
    throw new Error("local budget stops must be numeric and soft stop must not exceed hard stop");
  }
  if (usage >= hardStop) return { hardStop, mode: "hard-stop", softStop, usage };
  if (usage >= softStop) return { hardStop, mode: "remote-only", softStop, usage };
  return { hardStop, mode: "local-allowed", softStop, usage };
}

export function dispatchSelectionDecision(state = {}, config = {}) {
  const capacity = activeWorkerCapacity(state, config);
  const headroom = capacity.headroom;
  const candidates = toArray(state.startableTickets);
  const requireFootprint = config.requireDispatchFootprint !== false;
  const budget = localBudgetPolicy(state, config);

  if (headroom <= 0) {
    return {
      action: workflowDecisionActions.waitForSignal,
      deferred: candidates.map((ticket) => ({
        id: ticket?.id,
        reason: "worker concurrency cap has no headroom",
      })),
      capacity,
      selected: [],
    };
  }

  const activeItems = activeFootprintItems(state).map((item) => ({
    id: item?.id ?? item?.number ?? item?.url,
    footprint: footprintEntries(item),
  }));
  const selected = [];
  const deferred = [];
  const localStartLimit = Number(config.localStartsBelowSoftLimit ?? headroom);
  if (!Number.isInteger(localStartLimit) || localStartLimit < 0) {
    throw new Error("local starts below the soft budget stop must be a non-negative integer");
  }
  let localStarts = 0;
  const routedCandidates = candidates
    .map((ticket, index) => ({ index, kinds: eligibleWorkerKinds(ticket, config), ticket }))
    .sort((left, right) => {
      const leverageDifference = ticketLeverage(right.ticket) - ticketLeverage(left.ticket);
      if (leverageDifference !== 0) return leverageDifference;
      const priorityDifference = ticketPriority(left.ticket) - ticketPriority(right.ticket);
      if (priorityDifference !== 0) return priorityDifference;
      return left.index - right.index;
    });

  for (const { kinds, ticket } of routedCandidates) {
    if (selected.length >= headroom) {
      deferred.push({
        id: ticket?.id,
        reason: "worker concurrency headroom is already allocated",
      });
      continue;
    }

    const ticketFootprint = footprintEntries(ticket);
    if (
      requireFootprint &&
      ticketFootprint.length === 0 &&
      (activeItems.length > 0 || selected.length > 0)
    ) {
      deferred.push({ id: ticket?.id, reason: "missing predicted file footprint" });
      continue;
    }

    let worker;
    if (kinds != null) {
      if (kinds.includes("remote")) {
        worker = "remote";
      } else if (
        kinds.includes("local") &&
        (budget.mode === "remote-only" || budget.mode === "hard-stop")
      ) {
        deferred.push({
          id: ticket?.id,
          reason:
            budget.mode === "hard-stop"
              ? "configured hard local budget stop reached"
              : "local-heavy starts are paused at the configured soft budget stop",
        });
        continue;
      } else if (kinds.includes("local") && localStarts >= localStartLimit) {
        deferred.push({
          id: ticket?.id,
          reason: "configured per-tick local start limit is already allocated",
        });
        continue;
      } else if (kinds.includes("local")) {
        worker = "local";
      } else {
        deferred.push({ id: ticket?.id, reason: "no configured worker is authorized" });
        continue;
      }
    }

    const conflict = [...activeItems, ...selected].find((item) =>
      footprintsConflict(ticketFootprint, item.footprint),
    );

    if (conflict) {
      deferred.push({
        id: ticket?.id,
        conflictsWith: conflict.id,
        reason: "predicted file footprint collides with active or selected work",
      });
      continue;
    }

    selected.push({
      id: ticket?.id,
      footprint: ticketFootprint,
      ...(worker ? { worker } : {}),
    });
    if (worker === "local") localStarts += 1;
  }

  if (selected.length > 0) {
    return {
      action: workflowDecisionActions.dispatchStartableWork,
      capacity,
      deferred,
      selected,
    };
  }

  const missingFootprintOnly =
    deferred.length > 0 &&
    deferred.every((item) => item.reason === "missing predicted file footprint");

  return {
    action:
      deferred.length > 0 &&
      deferred.every((item) => item.reason === "configured hard local budget stop reached")
        ? workflowDecisionActions.stopBudgetExhausted
        : missingFootprintOnly
          ? workflowDecisionActions.requestFileFootprint
          : workflowDecisionActions.deferForFileContention,
    ...(budget.mode !== "unconfigured" ? { budget } : {}),
    capacity,
    deferred,
    selected,
  };
}

function hostedReviewProviderName(state = {}, config = {}) {
  return String(
    state.hostedReviewProvider ??
      state.reviewProvider ??
      state.provider ??
      config.hostedReviewProvider ??
      "CodeRabbit",
  );
}

export function hostedReviewEscalationDecision(state = {}, config = {}) {
  const provider = hostedReviewProviderName(state, config);
  const providerKey = normalize(provider);
  const recommended = Boolean(state.recommended || state.required || state.highRisk);
  const hasPr = Boolean(state.prExists || state.prUrl);
  const hostedCoversDiff = hostedReviewCoversCurrentDiff(state);
  const autoReviewMode = normalize(state.autoReviewMode ?? state.autoReview);
  const requiresAutoReviewResolution =
    state.requiresAutoReviewResolution ??
    config.requiresAutoReviewResolution ??
    providerKey === "coderabbit";
  const supportsLocalCli =
    state.supportsLocalCli ?? config.supportsLocalCli ?? providerKey === "coderabbit";
  const autoReviewKnown = ["enabled", "disabled", "opt-in", "label", "description"].includes(
    autoReviewMode,
  );

  if (!recommended) {
    return {
      action: workflowDecisionActions.leaveUnchanged,
      reason: `${provider} hosted review is not required for this diff`,
    };
  }

  if (state.hostedReviewComplete && hostedCoversDiff) {
    return {
      action: workflowDecisionActions.hostedReviewComplete,
      reason: "hosted review already covers the current review-relevant diff",
    };
  }

  if (state.hostedReviewPending && hostedCoversDiff) {
    return {
      action: workflowDecisionActions.hostedReviewPending,
      reason: "hosted review is already pending for the current review-relevant diff",
    };
  }

  if (hasPr && requiresAutoReviewResolution && !autoReviewKnown) {
    return {
      action: workflowDecisionActions.resolveAutoReviewState,
      reason: `resolve ${provider} auto-review mode before posting review commands`,
    };
  }

  if (hasPr && autoReviewMode === "enabled") {
    return {
      action: workflowDecisionActions.hostedReviewPending,
      reason: "auto-review is enabled; wait for hosted review state",
    };
  }

  if (hasPr) {
    if (state.draft === true || normalize(state.prState) === "draft") {
      return {
        action: workflowDecisionActions.deferUntilPrReady,
        reason: "request hosted review only after the PR is ready for review",
      };
    }

    return {
      action: workflowDecisionActions.requestPrReview,
      reason: `request ${provider} hosted PR review with the configured PR command`,
    };
  }

  if (state.explicitLocalCliRequest && state.remoteWorker !== true && supportsLocalCli) {
    return {
      action: workflowDecisionActions.runLocalCli,
      reason: `local ${provider} CLI was explicitly requested before a PR exists`,
    };
  }

  return {
    action: workflowDecisionActions.leaveUnchanged,
    reason: "no PR-hosted review path exists yet",
  };
}

export function codeRabbitEscalationDecision(state = {}) {
  return hostedReviewEscalationDecision(
    { ...state, hostedReviewProvider: state.hostedReviewProvider ?? "CodeRabbit" },
    { requiresAutoReviewResolution: true, supportsLocalCli: true },
  );
}

export function classifyInstructionSource(instruction = {}) {
  const source = normalize(instruction.source);
  const text = String(instruction.text ?? "");
  const trusted = TRUSTED_POLICY_SOURCES.has(source);
  const overrideAttempt = UNTRUSTED_OVERRIDE_PATTERNS.some((pattern) => pattern.test(text));

  if (!trusted && overrideAttempt) {
    return {
      action: workflowDecisionActions.ignoreUntrustedOverride,
      trusted: false,
      reason: "untrusted source attempted to override workflow policy",
    };
  }

  return {
    action: trusted ? "MAY_APPLY_AS_POLICY" : workflowDecisionActions.treatAsWorkContext,
    trusted,
    reason: trusted ? "trusted policy source" : "untrusted source may describe work but not policy",
  };
}
