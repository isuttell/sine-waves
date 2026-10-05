#!/usr/bin/env node
// Tick snapshot for ziw-orchestrate: assemble the code-host state one tick
// needs as a single JSON blob, so the orchestrator reasons over a compact
// snapshot instead of dozens of tool round-trips.
//
// Usage:
//   node tick-snapshot.mjs [--repo owner/name] [--limit 50] [--linear-team KEY|UUID|NAME] [--no-local-worktrees] [--pretty]
//
// GitHub state comes from the `gh` CLI (must be installed and authenticated).
// Linear state is included only when --linear-team is given and either
// LINEAR_API_KEY exists or linear-graphql.mjs setup has stored a local macOS
// credential; otherwise the tracker section reports skipped and the caller uses
// its tracker tooling as usual. Full issue bodies stay on the tracker tools;
// this snapshot carries only workflow metadata and derived file footprints.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

import { hasLinearCredential, linearGraphqlRequest } from "./linear-graphql.mjs";
import { loadLinearSnapshot } from "./linear-snapshot.mjs";
import { localWorktrees } from "./worktree-snapshot.mjs";

const startedAt = performance.now();
const args = process.argv.slice(2);
const pretty = args.includes("--pretty");
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const argValues = (flag) =>
  args.flatMap((arg, index) => {
    if (arg === flag) return args[index + 1] ? [args[index + 1]] : [];
    if (arg.startsWith(`${flag}=`)) return [arg.slice(flag.length + 1)];
    return [];
  });

const fail = (message) => {
  console.error(`tick-snapshot: ${message}`);
  process.exit(1);
};

const gh = (ghArgs, input) => {
  try {
    return execFileSync("gh", ghArgs, {
      encoding: "utf8",
      input,
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (error) {
    fail(`gh ${ghArgs[0]} failed: ${error.stderr?.toString().trim() || error.message}`);
  }
};

const deriveRepo = () => {
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    const match = url.match(/[:/]([^/:]+\/[^/]+?)(?:\.git)?$/);
    if (match) return match[1];
  } catch {
    // fall through to the explicit error below
  }
  return undefined;
};

const repo = argValue("--repo") ?? deriveRepo();
if (!repo || !repo.includes("/")) fail("cannot determine repo; pass --repo owner/name");
const [owner, name] = repo.split("/");
const limit = Number(argValue("--limit") ?? 50);
if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
  fail("--limit must be an integer from 1 to 100");
}

const PR_QUERY = `
query($owner: String!, $name: String!, $limit: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef {
      name
      target {
        ... on Commit { oid statusCheckRollup { state contexts(first: 50) { totalCount nodes {
          ... on CheckRun { name conclusion status }
          ... on StatusContext { context state }
        } } } }
      }
    }
    pullRequests(states: OPEN, first: $limit, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        number title url isDraft updatedAt changedFiles
        author { login __typename }
        headRefName headRefOid baseRefName
        mergeable mergeStateStatus reviewDecision
        autoMergeRequest { enabledAt }
        labels(first: 20) { nodes { name } }
        reviewThreads(first: 100) { totalCount nodes { isResolved } }
        reviews(last: 20) { totalCount nodes { author { login } state submittedAt commit { oid } } }
        commits(last: 1) { nodes { commit { statusCheckRollup { state contexts(first: 60) { totalCount nodes {
          ... on CheckRun { name conclusion status }
          ... on StatusContext { context state }
        } } } } } }
      }
    }
  }
}`;

const checkSummary = (rollup) => {
  if (!rollup) return { state: "NONE", failed: [], pending: [] };
  const failed = [];
  const pending = [];
  for (const node of rollup.contexts?.nodes ?? []) {
    const label = node.name ?? node.context ?? "unknown";
    const outcome = node.conclusion ?? node.state ?? node.status ?? "UNKNOWN";
    if (["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED"].includes(outcome)) {
      failed.push(label);
    } else if (["PENDING", "QUEUED", "IN_PROGRESS", "EXPECTED", "WAITING"].includes(outcome)) {
      pending.push(label);
    }
  }
  return {
    state: rollup.state ?? "UNKNOWN",
    failed,
    pending,
    truncated: (rollup.contexts?.totalCount ?? 0) > (rollup.contexts?.nodes?.length ?? 0),
  };
};

const latestReviewByAuthor = (reviews) => {
  const byAuthor = new Map();
  for (const review of reviews ?? []) {
    if (!review.author?.login || review.state === "COMMENTED") continue;
    byAuthor.set(review.author.login, {
      state: review.state,
      submittedAt: review.submittedAt,
      headSha: review.commit?.oid ?? null,
    });
  }
  return Object.fromEntries(byAuthor);
};

const isDependencyBotAuthor = (login) => {
  const normalized = String(login ?? "").toLowerCase();
  return normalized.includes("dependabot") || normalized.includes("renovate");
};

const pullRequestFiles = (number, expectedCount) => {
  const pages = JSON.parse(
    gh(["api", "--paginate", "--slurp", `repos/${repo}/pulls/${number}/files?per_page=100`]),
  );
  const files = pages.flat();
  if (Number.isInteger(expectedCount) && files.length !== expectedCount) {
    fail(`PR #${number} file snapshot returned ${files.length} of ${expectedCount} changed files`);
  }
  return files;
};

const reviewDiffFingerprint = (files) => {
  const canonical = files
    .map((file) => ({
      additions: file.additions,
      changes: file.changes,
      deletions: file.deletions,
      filename: file.filename,
      previousFilename: file.previous_filename ?? null,
      sha: file.sha,
      status: file.status,
    }))
    .sort((left, right) => left.filename.localeCompare(right.filename));
  return `sha256:${createHash("sha256").update(JSON.stringify(canonical)).digest("hex")}`;
};

const prsByNumber = new Map();
let after = null;
let repoData = null;
do {
  const requestArgs = [
    "api",
    "graphql",
    "-f",
    `query=${PR_QUERY}`,
    "-F",
    `owner=${owner}`,
    "-F",
    `name=${name}`,
    "-F",
    `limit=${limit}`,
  ];
  if (after) requestArgs.push("-f", `after=${after}`);
  const pageData = JSON.parse(gh(requestArgs)).data?.repository;
  if (!pageData?.pullRequests) fail("GitHub query returned no pull request connection");
  repoData ??= pageData;
  for (const pr of pageData.pullRequests.nodes ?? []) prsByNumber.set(pr.number, pr);
  const pageInfo = pageData.pullRequests.pageInfo;
  after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
  if (pageInfo?.hasNextPage && !after) {
    fail("GitHub pull request query reported another page without an end cursor");
  }
} while (after);

const prNodes = [...prsByNumber.values()];
if (prNodes.length < (repoData.pullRequests.totalCount ?? 0)) {
  fail("GitHub pull request pagination returned fewer PRs than totalCount");
}
repoData.pullRequests.nodes = prNodes;

const baselineRollup = repoData.defaultBranchRef?.target?.statusCheckRollup;
const baseline = {
  branch: repoData.defaultBranchRef?.name ?? null,
  headSha: repoData.defaultBranchRef?.target?.oid ?? null,
  checks: checkSummary(baselineRollup),
};
baseline.green = baseline.checks.state === "SUCCESS";

const prs = (repoData.pullRequests?.nodes ?? []).map((pr) => {
  const files = pullRequestFiles(pr.number, pr.changedFiles);
  return {
    number: pr.number,
    title: pr.title,
    url: pr.url,
    state: "open",
    open: true,
    author: pr.author?.login ?? null,
    isBot: pr.author?.__typename === "Bot",
    isDependencyBot: isDependencyBotAuthor(pr.author?.login),
    isDraft: pr.isDraft,
    draftState: pr.isDraft ? "draft" : "ready-for-review",
    updatedAt: pr.updatedAt,
    changedFiles: pr.changedFiles,
    reviewDiffFingerprint: reviewDiffFingerprint(files),
    headRefName: pr.headRefName,
    headSha: pr.headRefOid,
    baseRefName: pr.baseRefName,
    mergeable: pr.mergeable,
    mergeStateStatus: pr.mergeStateStatus,
    reviewDecision: pr.reviewDecision,
    autoMergeArmed: Boolean(pr.autoMergeRequest),
    labels: (pr.labels?.nodes ?? []).map((label) => label.name),
    unresolvedThreads: (pr.reviewThreads?.nodes ?? []).filter((t) => !t.isResolved).length,
    reviewThreadsTruncated: (pr.reviewThreads?.totalCount ?? 0) > 100,
    reviewsTruncated: (pr.reviews?.totalCount ?? 0) > (pr.reviews?.nodes?.length ?? 0),
    latestReviews: latestReviewByAuthor(pr.reviews?.nodes),
    checks: checkSummary(pr.commits?.nodes?.[0]?.commit?.statusCheckRollup),
  };
});

const linearTeam = argValue("--linear-team");
const linearRouteLabel = argValue("--linear-route-label") ?? repo;
const linearStates = [
  ...new Set(
    [...argValues("--linear-state"), ...argValues("--linear-states")]
      .flatMap((value) => String(value).split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  ),
];
let linear = {
  skipped: "no --linear-team or Linear credential; use tracker tooling",
};
if (linearTeam && hasLinearCredential()) {
  try {
    linear = await loadLinearSnapshot({
      request: linearGraphqlRequest,
      selector: linearTeam,
      states: linearStates,
      routeLabel: linearRouteLabel,
    });
  } catch (error) {
    fail(`Linear query failed: ${error.message}`);
  }
}

let worktrees = [];
if (!args.includes("--no-local-worktrees")) {
  try {
    worktrees = localWorktrees({ baseline, repo });
  } catch (error) {
    fail(`local worktree query failed: ${error.message}`);
  }
}

const snapshot = {
  v: 2,
  generatedAt: new Date().toISOString(),
  repo,
  sources: {
    github: "complete",
    linear: linear.skipped ? "missing" : "complete",
    worktrees: args.includes("--no-local-worktrees") ? "skipped" : "complete",
  },
  baseline,
  footprint: {
    openPrCount: repoData.pullRequests?.totalCount ?? prs.length,
    productPrCount: prs.filter((pr) => !pr.isDependencyBot).length,
    draftPrCount: prs.filter((pr) => pr.isDraft).length,
    readyForReviewPrCount: prs.filter((pr) => !pr.isDraft).length,
    botPrCount: prs.filter((pr) => pr.isBot).length,
    dependencyBotPrCount: prs.filter((pr) => pr.isDependencyBot).length,
  },
  prs,
  worktrees,
  linear,
};
const snapshotBytes = Buffer.byteLength(JSON.stringify(snapshot));
snapshot.usage = {
  elapsedMs: Math.round(performance.now() - startedAt),
  outputBytes: snapshotBytes,
  estimatedOutputTokens: Math.ceil(snapshotBytes / 4),
};
process.stdout.write(`${JSON.stringify(snapshot, null, pretty ? 2 : 0)}\n`);
