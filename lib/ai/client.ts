import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

if (!openRouterApiKey) {
  console.warn("AI models may not work. OPENROUTER_API_KEY or OPENAI_API_KEY is not set.");
}

export const aiClient = createOpenRouter({
  apiKey: openRouterApiKey || "",
});
