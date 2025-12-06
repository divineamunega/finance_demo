import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const apiKey = process.env.VERCEL_API_KEY || "";

if (!apiKey) {
  console.warn("AI models may not work. OPENROUTER_API_KEY or OPENAI_API_KEY is not set.");
}

export const aiClient = createOpenRouter({
  apiKey
});
