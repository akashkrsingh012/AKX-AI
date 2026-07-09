#!/usr/bin/env node
/**
 * AKX AI — verify cloud AI configuration and test one prompt.
 * Usage: node scripts/verify-ai.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const PLACEHOLDER = [/^your[-_]/i, /^sk-your-/i, /^gsk_your-/i, /^sk-ant-your-/i, /^add your /i, /^placeholder/i];

function keyStatus(name, value) {
  if (!value?.trim()) return { name, status: "MISSING" };
  if (value.trim().length < 12) return { name, status: "INVALID (too short)" };
  if (PLACEHOLDER.some((p) => p.test(value.trim()))) return { name, status: "PLACEHOLDER" };
  return { name, status: "LOADED" };
}

const keys = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
];

console.log("\n=== AKX AI Configuration Report ===\n");
console.log("Env file: backend/services/agent/.env\n");

console.log("API Keys:");
for (const k of keys) {
  const r = keyStatus(k, process.env[k]);
  console.log(`  ${r.name.padEnd(22)} ${r.status}`);
}

const { getConfiguredProviders, getAIMode, getActiveModelName, invokeModel } =
  await import("../utils/model.js");

const providers = getConfiguredProviders();
console.log("\nRuntime:");
console.log("  Cloud configured:", providers.any);
console.log("  Active provider:", getAIMode());
console.log("  Active model:   ", getActiveModelName() || "none");
console.log("  Providers:      ", JSON.stringify(providers));

console.log("\n=== Live Prompt Test ===");
console.log('Prompt: "What is Operating System?"\n');

if (!providers.any) {
  console.log("RESULT: FAILED — no valid API key configured");
  console.log("FIX:    Add ANTHROPIC_API_KEY or GROQ_API_KEY to backend/services/agent/.env");
  process.exit(1);
}

try {
  const { HumanMessage, SystemMessage } = await import("@langchain/core/messages");
  const response = await invokeModel(null, [
    new SystemMessage("You are AKX AI. Answer concisely."),
    new HumanMessage("What is Operating System?"),
  ], "chat");

  const preview = String(response.content).slice(0, 200).replace(/\n/g, " ");
  console.log("RESULT: SUCCESS");
  console.log("Mode:  ", response.aiMode);
  console.log("Model: ", response.model);
  console.log("Answer:", preview + "...");
  process.exit(0);
} catch (err) {
  console.log("RESULT: FAILED —", err.message);
  process.exit(1);
}
