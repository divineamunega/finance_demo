import { generateText} from "ai";
import { aiClient } from "./client";
import { createFinancialTools } from "./tools";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ToolResult {
  toolName: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
}

interface ChatResponse {
  message: string;
  toolResults: ToolResult[];
}


function buildSystemMessage(financialContext: string): Message {
  return {
    role: 'system',
    content: `You are a helpful financial assistant for a personal finance app. You help users understand their spending, provide budgeting advice, and answer questions about their financial data.

You have access to the following tools to help users manage their finances:
- get_account_balance: Check account balances
- withdraw_money: Withdraw funds from accounts
- transfer_money: Transfer money between accounts or to other users

Use these tools when users ask you to perform financial operations. For example:
- "What's my balance?" → use get_account_balance
- "Withdraw $50" → use withdraw_money
- "Send $100 to john@example.com" → use transfer_money

${financialContext ? `Current financial context:\n${financialContext}` : 'No financial data available yet.'}

Be conversational, helpful, and provide actionable advice. Keep responses concise (2-3 paragraphs max).`,
  };
}

export async function processChat(
  messages: Message[],
  financialContext: string,
  userId: string
): Promise<ChatResponse> {
  const model =  "qwen/qwen3-235b-a22b:free";

  const systemMessage = buildSystemMessage(financialContext);
  const conversationHistory = messages.slice(-10);

  
  const result = await generateText({
    model: aiClient(model),
    messages: [systemMessage, ...conversationHistory],
    tools: createFinancialTools(userId),
    temperature: 0.7,
  });

  const finalMessage = result.text;
  const toolResults: ToolResult[] = [];


  if (!finalMessage) {
    throw new Error('No response from AI');
  }

  return {
    message: finalMessage,
    toolResults,
  };
}
