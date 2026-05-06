#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const TIMEOUT_MS = 5000;

function read(relative_path) {
  return fs.readFileSync(path.join(ROOT, relative_path), "utf8");
}

function pass(name) {
  console.log(`ok - ${name}`);
}

function fail(name, detail) {
  console.error(`not ok - ${name}`);
  if (detail) console.error(`  ${detail}`);
  process.exitCode = 1;
}

function require_pattern(name, content, pattern) {
  if (pattern.test(content)) pass(name);
  else fail(name, `missing pattern: ${pattern}`);
}

async function fetch_with_timeout(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function validate_live_bridge() {
  const site_origin_env = process.env.BRAVETTO_SITE_ORIGIN;
  if (!site_origin_env) {
    fail("live bravetto /api/witness bridge origin", "BRAVETTO_SITE_ORIGIN is required");
    return;
  }

  const site_origin = site_origin_env.replace(/\/$/, "");

  try {
    const response = await fetch_with_timeout(`${site_origin}/api/witness`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "stream-witness-check@bravetto.com",
        domain: "bravetto.com/stream-check",
      }),
    });
    if (response.status === 202) pass("live bravetto /api/witness bridge");
    else fail("live bravetto /api/witness bridge", `status ${response.status}`);
  } catch (error) {
    fail("live bravetto /api/witness bridge", error.message);
  }
}

async function validate_live_organism() {
  const origin = process.env.ABEONE_MCP_ORIGIN?.replace(/\/$/, "");
  const token = process.env.MCP_AUTH_TOKEN;

  if (!origin || !token) {
    const message = "ABEONE_MCP_ORIGIN and MCP_AUTH_TOKEN are required";
    fail("live organism witness credentials", message);
    return;
  }

  try {
    const witness = await fetch_with_timeout(`${origin}/api/witness`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        what: "Bravetto witness-stream validation reached the organism.",
        from: "bravetto.com",
        pattern: "stream_validation",
      }),
    });
    if (!witness.ok) {
      fail("live organism /api/witness", `status ${witness.status}`);
      return;
    }
    pass("live organism /api/witness");
  } catch (error) {
    fail("live organism /api/witness", error.message);
    return;
  }

  try {
    const stream = await fetch_with_timeout(`${origin}/api/stream?n=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const type = stream.headers.get("content-type") || "";
    if (stream.ok && type.includes("text/event-stream")) {
      pass("live organism /api/stream");
    } else {
      fail(
        "live organism /api/stream",
        `status ${stream.status}, content-type ${type || "missing"}`,
      );
    }
  } catch (error) {
    fail("live organism /api/stream", error.message);
  }
}

async function main() {
  const sales = read("sales.html");
  const witness_api = read("api/witness.js");

  require_pattern(
    "sales lead success reports to witness bridge",
    sales,
    /fetch\("\/api\/witness"/,
  );
  require_pattern(
    "witness bridge keeps bearer token server-side",
    witness_api,
    /process\.env\.MCP_AUTH_TOKEN/,
  );
  require_pattern(
    "witness bridge targets organism witness endpoint",
    witness_api,
    /\/api\/witness/,
  );
  require_pattern(
    "witness bridge emits bravetto.com source",
    witness_api,
    /from:\s*"bravetto\.com"/,
  );

  await validate_live_bridge();
  await validate_live_organism();

  if (process.exitCode) process.exit(process.exitCode);
}

main().catch((error) => {
  fail("witness-stream validator", error.stack || error.message);
  process.exit(process.exitCode || 1);
});
