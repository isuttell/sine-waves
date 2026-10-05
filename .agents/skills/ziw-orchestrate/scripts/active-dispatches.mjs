const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const toArray = (value) => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const isLiveDispatch = (dispatch) =>
  dispatch?.returned !== true &&
  dispatch?.stopped !== true &&
  dispatch?.hasPr !== true &&
  !["returned", "stopped", "failed", "completed", "stale"].includes(
    normalize(dispatch?.state ?? dispatch?.status),
  );

const issueIdentifier = (item) => {
  const exact = [item?.issueId, item?.identifier, item?.ticket]
    .map((value) => String(value ?? "").trim())
    .find((value) => /^[A-Z][A-Z0-9]+-\d+$/i.test(value));
  if (exact) return exact.toUpperCase();
  const embedded = [
    item?.branch,
    item?.headRefName,
    item?.title,
    item?.url,
    item?.path,
    item?.worktree,
  ]
    .map((value) => String(value ?? "").match(/[A-Z][A-Z0-9]+-\d+/i)?.[0])
    .find(Boolean)
    ?.toUpperCase();
  if (embedded) return embedded;
  const id = String(item?.id ?? "").trim();
  return /^[A-Z][A-Z0-9]+-\d+$/i.test(id) && !/^PR-\d+$/i.test(id) ? id.toUpperCase() : undefined;
};

const itemMentionsIssue = (item, identifier) => {
  if (!identifier) return false;
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return [
    item?.issueId,
    item?.identifier,
    item?.ticket,
    item?.id,
    item?.title,
    item?.url,
    item?.branch,
    item?.headRefName,
    item?.worktree,
    item?.path,
  ].some((value) => pattern.test(String(value ?? "")));
};

const sameValue = (left, right) => left && right && normalize(left) === normalize(right);

export const completedByMergedPullRequest = (worktree, mergedPullRequests = []) =>
  mergedPullRequests.some((pr) => {
    const sameHead = sameValue(worktree?.headSha, pr?.headSha ?? pr?.headRefOid);
    if (worktree?.headSha && (pr?.headSha || pr?.headRefOid)) return sameHead;
    return sameValue(worktree?.branch, pr?.headRefName ?? pr?.branch);
  });

const itemsMatch = (left, right) => {
  const leftIssue = issueIdentifier(left);
  const rightIssue = issueIdentifier(right);
  return (
    (leftIssue && rightIssue && leftIssue === rightIssue) ||
    sameValue(left?.branch ?? left?.headRefName, right?.branch ?? right?.headRefName) ||
    sameValue(left?.headSha ?? left?.headRefOid, right?.headSha ?? right?.headRefOid) ||
    sameValue(left?.worktree ?? left?.path, right?.worktree ?? right?.path)
  );
};

const dispatchKey = (dispatch) =>
  normalize(
    issueIdentifier(dispatch) ??
      dispatch?.branch ??
      dispatch?.headRefName ??
      dispatch?.headSha ??
      dispatch?.worktree ??
      dispatch?.path ??
      dispatch?.id ??
      dispatch?.url,
  );

const mergeDispatches = (existing, incoming) => ({
  ...existing,
  ...incoming,
  id: existing.id ?? incoming.id,
  issueId: existing.issueId ?? incoming.issueId,
  branch: existing.branch ?? incoming.branch,
  headSha: existing.headSha ?? incoming.headSha,
  worktree: existing.worktree ?? incoming.worktree,
  footprint: [...new Set([...toArray(existing.footprint), ...toArray(incoming.footprint)])],
  occupiesWorkerSlot:
    existing.occupiesWorkerSlot !== false || incoming.occupiesWorkerSlot !== false,
  source:
    sameValue(existing.worktree, incoming.worktree) && existing.source
      ? existing.source
      : [...new Set([existing.source, incoming.source].filter(Boolean))].join("+"),
});

const isDependencyBotPr = (pr) => {
  if (pr?.isDependencyBot === true) return true;
  const login = normalize(pr?.author?.login ?? pr?.author ?? pr?.authorLogin);
  return login.includes("dependabot") || login.includes("renovate");
};

const isOpenProductPr = (pr) =>
  !isDependencyBotPr(pr) &&
  pr?.open !== false &&
  pr?.closed !== true &&
  pr?.merged !== true &&
  !pr?.mergedAt &&
  !["closed", "merged"].includes(normalize(pr?.state ?? pr?.status));

const isActiveLinearClaim = (issue) => {
  const stateType = normalize(issue?.stateType ?? issue?.state?.type);
  if (["completed", "canceled", "duplicate"].includes(stateType)) return false;
  return Boolean(
    issue?.activeClaim ??
    issue?.delegated ??
    issue?.assignedWorker ??
    issue?.workerSession ??
    issue?.agentSession,
  );
};

const isUnmergedWorktree = (worktree) =>
  worktree?.dirty === true ||
  (worktree?.completedByMergedPr !== true && worktree?.mergedIntoBaseline !== true);

export function reconcileActiveDelivery({ snapshot = {}, state = {}, pullRequests = [] }) {
  const reconciledPullRequests = pullRequests.map((pr) => ({
    ...pr,
    footprint: toArray(pr.footprint),
  }));
  const byKey = new Map();
  const matchingPrIndex = (item) =>
    reconciledPullRequests.findIndex((pr) => isOpenProductPr(pr) && itemsMatch(item, pr));
  const addDispatch = (dispatch) => {
    const prIndex = matchingPrIndex(dispatch);
    if (prIndex >= 0) {
      const pr = reconciledPullRequests[prIndex];
      reconciledPullRequests[prIndex] = {
        ...pr,
        footprint: [...new Set([...toArray(pr.footprint), ...toArray(dispatch.footprint)])],
      };
      return;
    }
    const matching = [...byKey.entries()].find(([, current]) => itemsMatch(dispatch, current));
    if (matching) {
      byKey.set(matching[0], mergeDispatches(matching[1], dispatch));
      return;
    }
    const key = dispatchKey(dispatch);
    if (key) byKey.set(key, dispatch);
  };

  for (const dispatch of [...toArray(state.dispatches), ...toArray(state.ledgerDispatches)].filter(
    isLiveDispatch,
  )) {
    addDispatch({ ...dispatch, occupiesWorkerSlot: true, source: dispatch.source ?? "ledger" });
  }
  for (const activeWork of toArray(state.activeWork).filter(isLiveDispatch)) {
    addDispatch({
      ...activeWork,
      occupiesWorkerSlot: true,
      source: activeWork.source ?? "local-active-work",
    });
  }

  const activeLinearIssues = [
    ...toArray(snapshot.linear?.activeIssues),
    ...toArray(state.activeLinearIssues),
  ].filter(isActiveLinearClaim);
  const worktrees = [...toArray(snapshot.worktrees), ...toArray(state.worktrees)].filter(
    (worktree) => worktree?.prunable !== true,
  );

  for (const issue of activeLinearIssues) {
    const identifier = issueIdentifier(issue);
    if (!identifier) continue;
    const worktree = worktrees.find((candidate) => itemMentionsIssue(candidate, identifier));
    addDispatch({
      id: identifier,
      issueId: identifier,
      state: "running",
      occupiesWorkerSlot: true,
      source: worktree ? "linear-active-claim+local-worktree" : "linear-active-claim",
      branch: worktree?.branch ?? null,
      headSha: worktree?.headSha ?? null,
      worktree: worktree?.path ?? null,
      footprint: toArray(issue.footprint),
    });
  }

  const issueById = new Map(
    [
      ...toArray(snapshot.linear?.activeIssues),
      ...toArray(state.activeLinearIssues),
      ...toArray(snapshot.linear?.issues),
      ...toArray(state.tickets ?? state.linearIssues),
      ...toArray(state.startableTickets),
    ]
      .map((issue) => [issueIdentifier(issue), issue])
      .filter(([identifier]) => identifier),
  );
  for (const pr of reconciledPullRequests) {
    const issue = issueById.get(issueIdentifier(pr));
    if (issue) {
      pr.issueLabels = [...new Set([...toArray(pr.issueLabels), ...toArray(issue.labels)])];
    }
  }
  for (const worktree of worktrees) {
    if (
      (worktree.branch && normalize(worktree.branch) === normalize(snapshot.baseline?.branch)) ||
      !isUnmergedWorktree(worktree)
    ) {
      continue;
    }
    const identifier = issueIdentifier(worktree);
    const issue = issueById.get(identifier);
    addDispatch({
      id: identifier ?? worktree.branch ?? worktree.path ?? worktree.headSha,
      issueId: identifier ?? null,
      state: "running",
      occupiesWorkerSlot: false,
      source: "local-worktree-unmerged",
      branch: worktree.branch ?? null,
      headSha: worktree.headSha ?? null,
      worktree: worktree.path ?? null,
      footprint: toArray(issue?.footprint),
    });
  }

  return {
    dispatches: [...byKey.values()],
    pullRequests: reconciledPullRequests,
  };
}

export const deriveActiveDispatches = (input) => reconcileActiveDelivery(input).dispatches;
