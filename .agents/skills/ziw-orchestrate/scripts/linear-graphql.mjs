#!/usr/bin/env node
// Minimal Linear GraphQL transport with macOS-only encrypted local credential storage.
//
// Usage:
//   node linear-graphql.mjs setup [--store <path>] [--service <name>] [--account <name>]
//   node linear-graphql.mjs query --query-file query.graphql [--variables-file vars.json]
//   node linear-graphql.mjs query < request.json

import { execFileSync } from "node:child_process";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { pathToFileURL } from "node:url";

export const LINEAR_GRAPHQL_ENDPOINT = "https://api.linear.app/graphql";
export const DEFAULT_KEYCHAIN_SERVICE = "zaks-io-skills.linear";
export const DEFAULT_KEYCHAIN_ACCOUNT = "linear-api-key";
const AES_GCM_AUTH_TAG_BYTES = 16;
export const DEFAULT_STORE_PATH = path.join(
  homedir(),
  ".config",
  "zaks-io-skills",
  "linear-api-key.json",
);

const usage = `Usage:
  node linear-graphql.mjs setup [--store <path>] [--service <name>] [--account <name>]
  node linear-graphql.mjs query [--query <graphql>] [--query-file <path>] [--variables <json>] [--variables-file <path>]
  node linear-graphql.mjs query < {"query":"query { viewer { id } }","variables":{}}
`;

const argValue = (args, flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const fail = (message) => {
  console.error(`linear-graphql: ${message}`);
  process.exit(1);
};

const readStdin = async () => {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) input += chunk;
  return input;
};

const parseJson = (text, label) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`cannot parse ${label}: ${error.message}`);
  }
};

const trimFinalNewline = (value) => value.replace(/\r?\n$/, "");

const assertMacOS = () => {
  if (process.platform !== "darwin") {
    throw new Error("encrypted credential storage is currently macOS-only");
  }
};

const runSecurity = (args, options = {}) =>
  execFileSync("security", args, {
    encoding: "utf8",
    input: options.input,
    stdio: options.stdio ?? [options.input == null ? "ignore" : "pipe", "pipe", "pipe"],
  });

const readHiddenLine = async (prompt) => {
  process.stderr.write(prompt);
  let echoDisabled = false;
  if (process.stdin.isTTY) {
    try {
      execFileSync("stty", ["-echo"], { stdio: ["inherit", "ignore", "ignore"] });
      echoDisabled = true;
    } catch {
      echoDisabled = false;
    }
  }

  try {
    const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
    const answer = await rl.question("");
    rl.close();
    process.stderr.write("\n");
    return answer;
  } finally {
    if (echoDisabled) {
      execFileSync("stty", ["echo"], { stdio: ["inherit", "ignore", "ignore"] });
    }
  }
};

const readApiKeyForSetup = async () => {
  if (process.stdin.isTTY) {
    process.stderr.write("Paste your Linear API key and press Return. Input is hidden.\n");
    return readHiddenLine("Linear API key: ");
  }
  return trimFinalNewline(await readStdin());
};

export function encryptLinearApiKey(apiKey, options = {}) {
  const key = options.key ?? randomBytes(32);
  if (key.byteLength !== 32) throw new Error("encryption key must be 32 bytes");

  const iv = options.iv ?? randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv, {
    authTagLength: AES_GCM_AUTH_TAG_BYTES,
  });
  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    key,
    blob: {
      version: 1,
      algorithm: "aes-256-gcm",
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
      ciphertext: ciphertext.toString("base64"),
      createdAt: new Date().toISOString(),
    },
  };
}

export function decryptLinearApiKeyBlob(blob, key) {
  if (blob?.version !== 1 || blob?.algorithm !== "aes-256-gcm") {
    throw new Error("unsupported encrypted Linear credential format");
  }
  if (key.byteLength !== 32) throw new Error("decryption key must be 32 bytes");

  const tag = Buffer.from(blob.tag, "base64");
  if (tag.byteLength !== AES_GCM_AUTH_TAG_BYTES) {
    throw new Error(`encrypted Linear credential auth tag must be ${AES_GCM_AUTH_TAG_BYTES} bytes`);
  }

  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(blob.iv, "base64"), {
    authTagLength: AES_GCM_AUTH_TAG_BYTES,
  });
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(Buffer.from(blob.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function writeEncryptedApiKeyStore(apiKey, options = {}) {
  const storePath = options.storePath ?? DEFAULT_STORE_PATH;
  const service = options.service ?? DEFAULT_KEYCHAIN_SERVICE;
  const account = options.account ?? DEFAULT_KEYCHAIN_ACCOUNT;
  const { key, blob } = encryptLinearApiKey(apiKey);
  const payload = { ...blob, keychainService: service, keychainAccount: account };

  const storeDir = path.dirname(storePath);
  mkdirSync(storeDir, { recursive: true, mode: 0o700 });
  chmodSync(storeDir, 0o700);
  writeFileSync(storePath, `${JSON.stringify(payload, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  chmodSync(storePath, 0o600);

  return { key, storePath, service, account };
}

export function storeDecryptKeyInKeychain(key, options = {}) {
  assertMacOS();
  const service = options.service ?? DEFAULT_KEYCHAIN_SERVICE;
  const account = options.account ?? DEFAULT_KEYCHAIN_ACCOUNT;

  runSecurity(["add-generic-password", "-s", service, "-a", account, "-U", "-w"], {
    input: `${key.toString("base64")}\n${key.toString("base64")}\n`,
  });
}

export function readDecryptKeyFromKeychain(options = {}) {
  assertMacOS();
  const service = options.service ?? DEFAULT_KEYCHAIN_SERVICE;
  const account = options.account ?? DEFAULT_KEYCHAIN_ACCOUNT;
  const output = runSecurity(["find-generic-password", "-s", service, "-a", account, "-w"]);
  const key = Buffer.from(trimFinalNewline(output), "base64");
  if (key.byteLength !== 32) throw new Error("stored Linear decrypt key has invalid length");
  return key;
}

export function hasLinearCredential(options = {}) {
  return (
    Boolean(options.env?.LINEAR_API_KEY ?? process.env.LINEAR_API_KEY) ||
    existsSync(options.storePath ?? DEFAULT_STORE_PATH)
  );
}

export function readStoredLinearApiKey(options = {}) {
  const env = options.env ?? process.env;
  if (env.LINEAR_API_KEY) return env.LINEAR_API_KEY;

  const storePath = options.storePath ?? DEFAULT_STORE_PATH;
  if (!existsSync(storePath)) {
    throw new Error(
      `no Linear credential found; run linear-graphql.mjs setup or set LINEAR_API_KEY`,
    );
  }

  const blob = parseJson(readFileSync(storePath, "utf8"), storePath);
  const key =
    options.decryptKey ??
    readDecryptKeyFromKeychain({
      service: blob.keychainService ?? options.service,
      account: blob.keychainAccount ?? options.account,
    });
  return decryptLinearApiKeyBlob(blob, key);
}

export async function linearGraphqlRequest(options = {}) {
  const apiKey = options.apiKey ?? readStoredLinearApiKey(options);
  const response = await (options.fetchImpl ?? fetch)(options.endpoint ?? LINEAR_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query: options.query, variables: options.variables ?? {} }),
  });

  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`Linear returned non-JSON response: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Linear HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join("; "));
  }
  return body;
}

async function readGraphqlInput(args) {
  const query =
    argValue(args, "--query") ??
    argValue(args, "-q") ??
    (argValue(args, "--query-file")
      ? readFileSync(argValue(args, "--query-file"), "utf8")
      : undefined);
  const variablesText =
    argValue(args, "--variables") ??
    (argValue(args, "--variables-file")
      ? readFileSync(argValue(args, "--variables-file"), "utf8")
      : undefined);

  if (query) {
    return {
      query,
      variables: variablesText ? parseJson(variablesText, "variables") : {},
    };
  }

  const input = (await readStdin()).trim();
  if (!input) throw new Error("expected GraphQL query input");

  if (input.startsWith("{")) {
    const parsed = parseJson(input, "stdin");
    if (!parsed.query) throw new Error("stdin JSON must include query");
    return { query: parsed.query, variables: parsed.variables ?? {} };
  }

  return { query: input, variables: variablesText ? parseJson(variablesText, "variables") : {} };
}

async function setup(args) {
  const apiKey = await readApiKeyForSetup();
  if (!apiKey.trim()) throw new Error("empty Linear API key");

  const storePath = argValue(args, "--store") ?? DEFAULT_STORE_PATH;
  const service = argValue(args, "--service") ?? DEFAULT_KEYCHAIN_SERVICE;
  const account = argValue(args, "--account") ?? DEFAULT_KEYCHAIN_ACCOUNT;
  process.stderr.write("Encrypting Linear API key and storing decrypt key in macOS Keychain...\n");
  const { key } = writeEncryptedApiKeyStore(apiKey.trim(), { storePath, service, account });
  storeDecryptKeyInKeychain(key, { service, account });

  process.stderr.write(`Stored encrypted Linear API key at ${storePath}\n`);
}

async function query(args) {
  const request = await readGraphqlInput(args);
  const body = await linearGraphqlRequest({
    ...request,
    storePath: argValue(args, "--store") ?? DEFAULT_STORE_PATH,
    service: argValue(args, "--service") ?? DEFAULT_KEYCHAIN_SERVICE,
    account: argValue(args, "--account") ?? DEFAULT_KEYCHAIN_ACCOUNT,
  });
  process.stdout.write(`${JSON.stringify(body, null, 2)}\n`);
}

async function main() {
  const cliArgs = process.argv.slice(2);
  if (cliArgs[0] === "--help" || cliArgs[0] === "-h") {
    process.stdout.write(usage);
    return;
  }
  const command = cliArgs[0] && !cliArgs[0].startsWith("-") ? cliArgs.shift() : "query";
  const args = cliArgs;
  if (command === "setup") {
    await setup(args);
    return;
  }
  if (command === "query") {
    await query(args);
    return;
  }
  fail(`unknown command: ${command}\n${usage}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => fail(error.message));
}
