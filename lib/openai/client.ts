import OpenAI from 'openai';

// Use a dedicated environment variable for OpenRouter
const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();

// Log for debugging (remove in production)
console.log("OpenRouter API Key available:", !!openRouterApiKey);

export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: openRouterApiKey || 'dummy-key', // Better to throw an error than use a dummy key
  defaultHeaders: {
    'HTTP-Referer': 'https://your-site.com', // Optional: helps with analytics
    'X-Title': 'Your Application Name' // Optional: helps with analytics
  }
});
