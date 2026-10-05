import { execFileSync } from "node:child_process";

import { completedByMergedPullRequest } from "./active-dispatches.mjs";

const git = (args, options = {}) => execFileSync("git", args, options);

const worktreeDirty = (worktreePath) => {
  try {
    return (
      git(["-C", worktreePath, "status", "--porcelain"], { encoding: "utf8" }).trim().length > 0
    );
  } catch {
    return null;
  }
};

const mergedIntoBaseline = (headSha, baseline, cwd) => {
  if (!headSha) return null;
  const refs = [
    baseline?.headSha,
    baseline?.branch ? `refs/remotes/origin/${baseline.branch}` : null,
    baseline?.branch,
  ].filter(Boolean);
  for (const ref of refs) {
    try {
      git(["merge-base", "--is-ancestor", headSha, ref], { cwd, stdio: "ignore" });
      return true;
    } catch (error) {
      if (error.status !== 1 && error.status != null) continue;
    }
  }
  return false;
};

const mergedPullRequestsForHead = (repo, headSha) => {
  if (!repo || !headSha) return [];
  try {
    const raw = execFileSync(
      "gh",
      [
        "api",
        "-H",
        "Accept: application/vnd.github+json",
        `repos/${repo}/commits/${headSha}/pulls`,
      ],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );
    return JSON.parse(raw)
      .filter((pr) => pr.merged_at)
      .map((pr) => ({
        number: pr.number,
        headRefName: pr.head?.ref,
        headSha: pr.head?.sha,
        mergedAt: pr.merged_at,
      }));
  } catch {
    return [];
  }
};

const commandError = (error) => error.stderr?.toString().trim() || error.message;

export const localWorktrees = ({ baseline, repo, cwd = process.cwd() }) => {
  let raw;
  try {
    raw = git(["worktree", "list", "--porcelain"], { cwd, encoding: "utf8" });
  } catch (error) {
    throw new Error(`cannot inspect git worktrees: ${commandError(error)}`);
  }

  return raw
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      const field = (name) =>
        lines.find((line) => line.startsWith(`${name} `))?.slice(name.length + 1) ?? null;
      const path = field("worktree");
      const headSha = field("HEAD");
      const branch = field("branch")?.replace(/^refs\/heads\//, "") ?? null;
      const dirty = path ? worktreeDirty(path) : null;
      const merged = mergedIntoBaseline(headSha, baseline, cwd);
      const mergedPullRequests =
        dirty === false && merged === false ? mergedPullRequestsForHead(repo, headSha) : [];
      return {
        path,
        headSha,
        branch,
        detached: lines.includes("detached"),
        locked: lines.some((line) => line === "locked" || line.startsWith("locked ")),
        prunable: lines.some((line) => line === "prunable" || line.startsWith("prunable ")),
        dirty,
        mergedIntoBaseline: merged,
        completedByMergedPr: completedByMergedPullRequest({ branch, headSha }, mergedPullRequests),
      };
    });
};
