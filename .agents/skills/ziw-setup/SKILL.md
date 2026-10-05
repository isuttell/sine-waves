---
name: ziw-setup
description: Use for workflow setup when setting up or refreshing a repository for agent workflows by creating docs/agents/workflow/config.md with repo commands, planning artifacts, issue tracking, agent adapters, review gates, and environment safety rules.
argument-hint: "[repo-path]"
---

# Setup

Create or refresh the repo-local agent config used by the other skills. Run this
once per repo, then rerun it when the workflow may have changed or the user wants
to verify that the config is current. The output is a compact lookup table, not
a narrative doc.

Include stable values workflow agents need repeatedly: repo commands, tracker
IDs, labels, agent access, review gates, handoff shape, and safety rules.
Agents should query external systems to refresh live state, not to rediscover
these values. If a value cannot be verified during setup, report the evidence
gap and the source that should verify it without storing a task in config.

Shared workflow skills may be distributed as project skills, plugin or
marketplace, managed settings, user/global-only, or mixed mode. Record which
mode this repo actually uses. Project-scoped generated `ziw-*` copies are valid
when repo, remote, or cloud workers need the skills from a fresh clone; treat
them as vendored generated dependencies from `zaks-io/skills`, update them
mechanically, and do not hand-edit them in downstream repos.

Setup is a verification pass, not a best-effort note-taking pass. Every populated
config value that can change agent behavior must have current evidence from the
repo, tracker, code host, CI, agent integration, environment config, or explicit
user instruction. Omit unverified values; missing required configuration blocks
the affected workflow. Report the evidence gap instead of inventing a value.

For encountered friction, use [friction-log.md](../ziw-orchestrate/references/friction-log.md)
with the configured complaint store and this role's mutation authority.

## Inputs

- Repo path to configure.
- Existing repo rules, CI, package scripts, issue tracker, and deploy docs.
- Existing spec indexes, specs, glossaries, context maps, and ADR conventions.
  When configuring unmapped glossary paths, use [glossary-discovery.md](../ziw-grill/references/glossary-discovery.md) for
  current and legacy glossary discovery. Preserve configured paths; default new
  glossaries to `GLOSSARY.md` and multi-context maps to `GLOSSARY-MAP.md`.
- Any user-provided tracker, agent access, or environment constraints.

## Output File

Create or update:

- `docs/agents/workflow/config.md`

Treat this file as the repo's workflow lookup table. Keep it terse: values,
paths, commands, IDs, routing, and policies. Keep project progress, blockers,
verification follow-ups, and TODOs in Linear or the configured issue tracker.
Read tool availability, CI/PR health, review results, and deployment status live;
never persist their snapshots in config. Status names and IDs describe the
workflow schema, not the current state of work. Omit inapplicable fields and
verification transcripts.

Use [references/project-config.md](references/project-config.md) as the field
index. Read the sections needed for the repo; omit inapplicable fields.
Load other references only for the matching work:

- Changing tracker states, labels, readiness, or issue body shape:
  [references/issue-tracker-contract.md](references/issue-tracker-contract.md).
- Configuring workers, recurring orchestration, or merge-safety policy:
  [references/operating-profile.md](references/operating-profile.md).
- Configuring a Linear + Cursor delegation path:
  [references/linear-cursor-example.md](references/linear-cursor-example.md).
- Updating role responsibilities or agent adapters:
  [references/agent-workflow.md](references/agent-workflow.md).
- Defining or changing cross-agent handoff shape:
  [references/handoff.md](references/handoff.md).

## Refresh Existing Config

If `docs/agents/workflow/config.md` already exists, read it before inspecting
anything else. Use it as the baseline for refresh:

- preserve verified stable values that still match current repo and tracker
  state
- re-verify every populated behavior-affecting field before leaving it
  authoritative; do not preserve a stale value just because it is already in the
  file
- re-run at least one read-only query against configured tracker IDs and
  query-safe names before trusting a project, team, board, or roadmap mapping
- check unresolved tracker setup work, changed commands, renamed labels, moved
  projects, changed CI, changed worker delegation paths, and changed environment
  rules
- replace stale slugs or display names that return empty tracker results when a
  verified provider ID or canonical name resolves the same scope
- update only fields that are missing, stale, wrong, or newly verified
- do not erase explicit human decisions unless current evidence or the user
  contradicts them
- report what changed, what stayed verified, and what remains unknown

When removing existing state notes, preserve actionable gaps in the configured
tracker within the task's write authority, searching for duplicates first. Do
not turn disabled optional integrations into new work. Without tracker-write
authority, report the state that still needs transfer; do not discard it or
substitute a local backlog. Keep only stable policy and mapping in config.
Use the configured intake route without readiness labels. Find prior setup work
with a bounded query scoped to that tracker location and repo route, then search
its titles/descriptions for the affected setting before creating a follow-up.

Do not regenerate the config from scratch when refreshing. The job is to detect
drift from the current config, then patch the lookup table.

## Verification Standard

Verify all populated workflow fields that setup writes or preserves:

- repo identity, default branch, branch prefix, package manager, lockfile, and
  command names from repo files and git metadata
- install, check, build, test, lint, smoke, preview, and generated-artifact
  commands from scripts, CI workflows, makefiles, justfiles, runbooks, or direct
  safe command execution
- planning artifact authority, paths, status convention, and documentation
  checks from spec indexes, context maps, ADR indexes, scripts, CI, or explicit
  user instruction
- issue tracker provider, location, team/project/board/roadmap, statuses,
  labels, priorities, estimate fields, relationships, issue templates, and query
  contracts with read-only tracker tool calls when tools are available
- code host default branch, branch protections, PR conventions, linked checks,
  and open PR query shape through git metadata, code host tools, or workflow
  files
- worker delegation paths, environment labels or fields, continuation paths, and
  remote worker delegation mechanics through tracker metadata, verified config,
  or explicit user instruction
- Claude, Codex, editor, and repo-local adapter paths by resolving files,
  symlinks, imports, and generated skill metadata from a clean path
- shared workflow skill distribution mode, source, lockfile, refresh command,
  project paths, symlink layout, plugin marketplace, and whether generated skill
  directories are committed dependencies, ignored local cache, or absent
- environment safety, deployment paths, hosted checks, preview rules, credential
  rules, and production approval rules from deployment config, CI, runbooks, or
  explicit user instruction

Do not run install, deploy, production mutation, expensive hosted actions, or
credentialed provider actions just to verify setup unless the user explicitly
approved that action. For those values, verify the command or path exists and
report that execution was not performed; do not cache an execution status in config.

Every gap must name the missing value and its verification source. Put project
follow-ups in the configured tracker within authorized scope; otherwise report
the required owner/action. The final report names workflows blocked by missing
configuration. Do not create an `Unknowns` checklist in Repo Config.

## Gather

Inspect files that exist:

- `AGENTS.md`, `CLAUDE.md`, editor or agent rules, and repo-local skills
- target repo's Claude Code integration config, `.claude/*`, and any repo-local
  agent, command, or skill directories that Claude should load
- `package.json`, lockfiles, Makefile, Justfile, turbo config, and CI workflows
- project status, roadmap, specs, ADRs, runbooks, and existing `docs/agents/*`
- existing agent label docs, such as `docs/agents/triage-labels.md`
- code host branch, default branch, PR, preview, and deploy workflows
- root `.coderabbit.yaml` when present, especially `reviews.auto_review`
- hosted review provider docs or app settings when CodeRabbit, Cursor Bugbot,
  or another PR review bot is enabled
- issue tracker provider, provider location, projects or boards, statuses,
  labels, issue templates, and existing issue examples by querying tracker tools
  when available
- environment files, deployment config, and service inventories

## Configure

Use the project-config template as the canonical field list. Populate only
verified values that future agents need repeatedly: repo commands and CI gates,
planning authority, tracker mapping and readiness, delegation and capacity,
review/merge authority, environments, complaint routing, and handoff shape.
Keep execution evidence and unresolved work out of config; report them in the
handoff and configured tracker rather than repeating the template as prose.

Check gate parity: local hooks and the required CI job should use the same
verification entrypoint. Record its command and job. Flag required checks
outside that entrypoint as a config gap rather than implying a partial local
command is the full gate. Preserve exact cache, threshold, environment, and
secret-scan scopes.

For hosted or unattended workflows, verify environment-enforced hooks, worker
continuation, loop limits, and production deploy approval from current evidence.
Store the stable policy only; baseline failures and repair work belong in the
tracker, with current CI health read live. Load the operating profile for those policies. For complaint
routing, prefer the configured MCP writer and verify its exposed schema;
tracker storage needs an explicit fallback. Never test delegation by assigning
real implementation work or test a complaint writer by filing a fictitious event.

## Issue Tracker Defaults

Find the tracker source of truth in live metadata, verified config, or explicit
user instruction. Read the relevant sections of the issue-tracker contract when
creating or changing the mapping. Its labels are defaults, not proof that the
tracker has them. Preserve different verified repo conventions.

Verify exact names and stable IDs with read-only tracker queries. Provider
locations must be query-safe; record the status and dependency field names the
tool actually accepts. Missing provider, status, label, estimate, or worker
values are omitted and reported as evidence gaps. Do not probe assignable agents by mutating real issues.
Record supported delegation paths and verified continuation handles rather
than caching the full assignee inventory.

If separate label docs exist, update them to mirror the config or point back
to it. Keep readiness, risk, review evidence, type, area, and ownership policy
consistent. The template and tracker contract own the default taxonomy and
label treatment rules; do not duplicate them here.

## Adapter Update

After writing the config, update short agent adapters when present:

- `AGENTS.md`
- `CLAUDE.md`
- editor or agent rules
- repo-local skill usage docs

Adapters should say to read `docs/agents/workflow/config.md` before using the
workflow skills. Keep them short and use
[references/agent-workflow.md](references/agent-workflow.md) as the adapter
contract.

If runtime-generated shared `ziw-*` skill files exist under `.agents/skills/`,
`.claude/skills/`, `.codex/skills/`, or `skills/`, decide whether those files
are a committed dependency, symlink fanout, ignored local cache, absent, or
repo-authored project-specific skills. For committed dependencies, record the
source and lockfile and commit mechanical updates. Never hand-edit downstream
generated copies.

For Claude Code, configure the target repo's Claude Code integration, not this
skills repo. Treat that integration as the source of truth for Claude-facing
agent, command, and skill registration. Configure it to import the target repo's
agent markdown, usually `AGENTS.md` through a one-line `CLAUDE.md` `@AGENTS.md`
import when supported. Claude Code is picky, so do not make independent copies.
Symlink repo-local Claude Code paths into the integration location when Claude
Code requires exact paths, then verify each link target resolves from a clean
checkout. Report any path Claude Code refuses to follow and track actionable
repair work outside config instead of guessing.

## Safety

- Never include secrets, tokens, signed URLs, customer payloads, or private logs
  in the config.
- Never deploy or mutate production while setting up config.
- Prefer exact discovered commands over guesses.
- Omit unverified commands and report the missing evidence.

## Done

Report:

- config path written
- whether this was first setup or refresh of an existing config
- whether the config is complete enough to be the workflow lookup table
- config fields changed or preserved and evidence gaps reported outside config
- workflows blocked by missing configuration and their tracker follow-ups
- commands discovered
- tracker routing and labels found or missing
- agent adapters updated
- missing decisions or access requiring the user
- validation command run
