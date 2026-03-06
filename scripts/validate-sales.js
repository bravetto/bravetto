#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const sales_path = path.join(__dirname, "..", "sales.html");
const html = fs.readFileSync(sales_path, "utf8");

const required_patterns = [
  {
    name: "voice overlay container",
    pattern: /id="voice-overlay"/,
  },
  {
    name: "voice close button",
    pattern: /id="voice-close"/,
  },
  {
    name: "mic status indicator",
    pattern: /id="mic-status"/,
  },
  {
    name: "mic status dot",
    pattern: /id="mic-dot"/,
  },
  {
    name: "abe trigger button",
    pattern: /id="abe-trigger"/,
  },
  {
    name: "context submit button",
    pattern: /id="context-submit"/,
  },
  {
    name: "suggestion chip",
    pattern: /class="chip"/,
  },
  {
    name: "native elevenlabs sdk import",
    pattern:
      /import\s*\{\s*Conversation\s*\}\s*from\s*"https:\/\/esm\.sh\/@elevenlabs\/client"/,
  },
  {
    name: "sdk bridged on window",
    pattern: /window\.ElevenLabsConversation\s*=\s*Conversation\s*;/,
  },
  {
    name: "activate abe function",
    pattern: /async function activateAbe\(\)/,
  },
  {
    name: "conversation start",
    pattern: /startSession\s*\(/,
  },
  {
    name: "agent id configured",
    pattern: /agentId:\s*"NnIz3T19gUiX1tnxhJqt"/,
  },
  {
    name: "close overlay on escape",
    pattern: /if \(e\.key === "Escape"\) hideOverlay\(\);/,
  },
  {
    name: "chip click activates abe",
    pattern: /querySelectorAll\("\.chip"\)[\s\S]*activateAbe\(\);/,
  },
  {
    name: "trigger button activates abe",
    pattern: /getElementById\("abe-trigger"\)[\s\S]*activateAbe\(\);/,
  },
  {
    name: "context submit activates abe",
    pattern: /getElementById\("context-submit"\)[\s\S]*activateAbe\(\);/,
  },
];

const forbidden_patterns = [
  {
    name: "legacy convai widget tag",
    pattern: /<elevenlabs-convai/i,
  },
  {
    name: "legacy convai script",
    pattern: /elevenlabs\.io\/convai-widget\/index\.js/i,
  },
];

const missing = required_patterns.filter((p) => !p.pattern.test(html));
const forbidden_found = forbidden_patterns.filter((p) => p.pattern.test(html));

if (missing.length || forbidden_found.length) {
  console.error("sales.html validation failed");

  if (missing.length) {
    console.error("Missing required contracts:");
    for (const item of missing) {
      console.error(`- ${item.name}`);
    }
  }

  if (forbidden_found.length) {
    console.error("Found forbidden legacy patterns:");
    for (const item of forbidden_found) {
      console.error(`- ${item.name}`);
    }
  }

  process.exit(1);
}

console.log("sales.html validation passed");
