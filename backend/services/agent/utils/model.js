import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";

dotenv.config({ override: true });

const PLACEHOLDER_PATTERNS = [
  /^add your /i,
  /^your[-_]/i,
  /^xxx$/i,
  /^placeholder/i,
  /^sk-your-/i,
  /^gsk_your-/i,
  /^paste_key_here$/i,
  /^your-openai-api-key$/i,
  /^your-groq-api-key$/i,
];

function isValidKey(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 12) return false;
  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isQuotaError(err) {
  const msg = (err?.message || "").toLowerCase();
  const code = err?.code || err?.error?.code || "";
  return (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    code === "insufficient_quota" ||
    code === "rate_limit_exceeded"
  );
}

function logApiError(provider, err) {
  const message = err?.message || String(err);
  const status = err?.status || err?.response?.status;
  console.error(`[AKX AI] ${provider} API error${status ? ` (${status})` : ""}:`, message);
  if (err?.error) console.error(`[AKX AI] ${provider} details:`, err.error);
}

export function createAIError(status, title, message) {
  const err = new Error(message);
  err.status = status;
  err.data = { success: false, title, message };
  return err;
}

function buildProviders() {
  const preferred = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const groqEntry = isValidKey(process.env.GROQ_API_KEY)
    ? {
        name: "groq",
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        client: new ChatGroq({
          apiKey: process.env.GROQ_API_KEY,
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          temperature: 0.7,
        }),
      }
    : null;

  const openRouterKey = isValidKey(process.env.OPENROUTER_API_KEY)
    ? process.env.OPENROUTER_API_KEY
    : null;
  const openRouterBaseUrl = process.env.OPENAI_BASE_URL || (openRouterKey ? "https://openrouter.ai/api/v1" : undefined);
  const openRouterModel = process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || "openai/gpt-4o-mini";
  const openaiApiKey = isValidKey(process.env.OPENAI_API_KEY)
    ? process.env.OPENAI_API_KEY
    : openRouterKey;

  const openaiEntry = openaiApiKey
    ? {
        name: openRouterKey && !isValidKey(process.env.OPENAI_API_KEY) ? "openrouter" : "openai",
        model: openRouterKey && !isValidKey(process.env.OPENAI_API_KEY) ? openRouterModel : process.env.OPENAI_MODEL || "gpt-4o-mini",
        client: new ChatOpenAI({
          apiKey: openaiApiKey,
          model: openRouterKey && !isValidKey(process.env.OPENAI_API_KEY) ? openRouterModel : process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 4096,
          ...(openRouterBaseUrl ? { configuration: { baseURL: openRouterBaseUrl } } : {}),
        }),
      }
    : null;

  if (preferred === "groq") {
    return [groqEntry, openaiEntry].filter(Boolean);
  }
  if (preferred === "openai") {
    return [openaiEntry, groqEntry].filter(Boolean);
  }
  return [openaiEntry, groqEntry].filter(Boolean);
}

const providers = buildProviders();
let lastUsedProvider = providers[0] || null;

export function getConfiguredProviders() {
  return {
    groq: providers.some((p) => p.name === "groq"),
    openai: providers.some((p) => p.name === "openai"),
    any: providers.length > 0,
  };
}

export function getActiveModelName() {
  return lastUsedProvider?.model || providers[0]?.model || null;
}

export function getAIMode() {
  return lastUsedProvider?.name || providers[0]?.name || "none";
}

export function assertAIConfigured() {
  if (providers.length > 0) return;

  throw createAIError(
    503,
    "AI Not Configured",
    "Set GROQ_API_KEY in backend/services/agent/.env (free at console.groq.com), then restart: npm run dev"
  );
}

export function getModel() {
  assertAIConfigured();
  return providers[0].client;
}

export async function invokeModel(_model, messages, _agentName) {
  assertAIConfigured();

  let lastError = null;

  for (const provider of providers) {
    try {
      console.log(`[AKX AI] Calling ${provider.name} (${provider.model})...`);
      const response = await provider.client.invoke(messages);
      const content = response?.content ?? response?.text;
      if (!content) {
        console.warn(`[AKX AI] ${provider.name} returned empty content`);
        continue;
      }

      lastUsedProvider = provider;
      console.log(`[AKX AI] ✓ Response from ${provider.name} (${provider.model})`);
      return {
        ...response,
        content: typeof content === "string" ? content : String(content),
        aiMode: provider.name,
        model: provider.model,
      };
    } catch (err) {
      lastError = err;
      logApiError(provider.name, err);

      if (isQuotaError(err) && providers.length > 1) {
        console.warn(`[AKX AI] ${provider.name} quota hit — trying next provider...`);
        continue;
      }
    }
  }

  throw createAIError(
    502,
    "AI Provider Error",
    lastError?.message || "All AI providers failed."
  );
}

console.log("[AKX AI] Env check:");
console.log("  GROQ_API_KEY loaded:", isValidKey(process.env.GROQ_API_KEY));
console.log("  OPENAI_API_KEY loaded:", isValidKey(process.env.OPENAI_API_KEY) || isValidKey(process.env.OPENROUTER_API_KEY));
console.log("  OPENROUTER_API_KEY loaded:", isValidKey(process.env.OPENROUTER_API_KEY));
console.log("  AI_PROVIDER:", process.env.AI_PROVIDER || "auto");

if (providers.length > 0) {
  console.log(
    `[AKX AI] Provider chain: ${providers.map((p) => `${p.name}:${p.model}`).join(" → ")}`
  );
} else {
  console.warn("[AKX AI] No valid API key in backend/services/agent/.env");
}

export { providers };
