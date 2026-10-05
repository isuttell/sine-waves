import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { validateInput, validateConfig, validateState } from "./planner-input-validator.mjs";

const usage =
  "Usage: node tick-plan.mjs <snapshot-or-envelope.json> [--config config.json] [--state state.json] [--pretty] [--debug]";

function validate(value, validator, source) {
  if (validator(value)) return;
  const error = validator.errors[0];
  const field = error.params.additionalProperty ?? error.params.missingProperty;
  const location = `${source}${error.instancePath || ""}${field ? `/${field}` : ""}`;
  throw new Error(`${location}: ${error.message}`);
}

function readJson(source, label) {
  if (source === undefined) return {};
  if (!source.trim()) throw new Error(`${label}: expected a file path`);
  let content;
  try {
    content = readFileSync(source === "-" ? 0 : source, "utf8");
  } catch (error) {
    throw new Error(`${label}: cannot read JSON input (${error.code})`);
  }
  try {
    return JSON.parse(content);
  } catch {
    // JSON.parse can include source values in its error message.
    throw new Error(`${label}: invalid JSON; expected a non-empty JSON object`);
  }
}

export function loadPlannerInput(args) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        config: { type: "string" },
        state: { type: "string" },
        pretty: { type: "boolean" },
        debug: { type: "boolean" },
      },
    });
  } catch {
    throw new Error(`invalid arguments\n${usage}`);
  }
  const { values, positionals } = parsed;
  if (positionals.length !== 1) throw new Error(`expected exactly one input\n${usage}`);
  if ([positionals[0], values.config, values.state].filter((file) => file === "-").length > 1) {
    throw new Error("stdin can supply only one planner input");
  }

  const input = readJson(positionals[0], "input");
  validate(input, validateInput, "input");
  const configFile = readJson(values.config, "--config");
  const stateFile = readJson(values.state, "--state");
  validate(configFile, validateConfig, "--config");
  validate(stateFile, validateState, "--state");

  const {
    snapshot: nestedSnapshot,
    config: inlineConfig,
    state: inlineState,
    queue,
    ...direct
  } = input;
  if (nestedSnapshot && Object.keys(direct).length > 0) {
    throw new Error("input: use either snapshot or direct snapshot fields, not both");
  }
  const snapshot = nestedSnapshot ?? direct;
  const config = { ...inlineConfig, ...configFile };
  const state = { ...queue, ...inlineState, ...stateFile };
  if (!snapshot.repo && !state.repo) {
    throw new Error(
      "snapshot is missing repo identity; refusing to plan from empty or partial evidence",
    );
  }
  if (snapshot.repo && state.repo && snapshot.repo !== state.repo) {
    throw new Error("snapshot.repo and state.repo must identify the same repository");
  }
  const soft = config.localBudgetSoftStopPercent;
  const hard = config.localBudgetHardStopPercent;
  if ((soft == null) !== (hard == null) || soft > hard) {
    throw new Error("config: local budget thresholds must be supplied together with soft <= hard");
  }
  return { snapshot, config, state, debug: values.debug ?? false, pretty: values.pretty ?? false };
}
