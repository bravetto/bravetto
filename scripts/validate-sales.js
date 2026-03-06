#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const sales_path = path.join(__dirname, "..", "sales.html");
const html = fs.readFileSync(sales_path, "utf8");

const required_patterns = [
  { name: "voice overlay container", pattern: /id="voice-overlay"/ },
  { name: "abe trigger button", pattern: /id="abe-trigger"/ },
  { name: "suggestion chip", pattern: /class="chip"/ },
  { name: "elevenlabs standard widget", pattern: /<elevenlabs-convai/ },
  { name: "elevenlabs script", pattern: /elevenlabs\.io\/convai-widget\/index\.js/ },
  { name: "widget fixed position css", pattern: /elevenlabs-convai\s*\{\s*position:\s*fixed;/s }
];

const forbidden_patterns = [
  { name: "ESM import of elevenlabs (causes microphone permission issues)", pattern: /import\s*\{\s*Conversation\s*\}\s*from\s*"https:\/\/esm\.sh\/@elevenlabs\/client"/ }
];

const missing = required_patterns.filter((p) => !p.pattern.test(html));
const forbidden_found = forbidden_patterns.filter((p) => p.pattern.test(html));

if (missing.length || forbidden_found.length) {
  console.error("sales.html validation failed");
  if (missing.length) missing.forEach(p => console.error("- Missing: " + p.name));
  if (forbidden_found.length) forbidden_found.forEach(p => console.error("- Forbidden: " + p.name));
  process.exit(1);
}
console.log("sales.html validation passed");
