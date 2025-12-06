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
  // Use a model that supports tool calling well
  const model = "openai/gpt-4o-mini";

  const systemMessage = buildSystemMessage(financialContext);
  const conversationHistory = messages.slice(-10);

  try {
    const result = await generateText({
      model: aiClient(model),
      messages: [systemMessage, ...conversationHistory],
      tools: createFinancialTools(userId),
      temperature: 0.7,
    });

    console.log('AI Result:', result);
    console.log('AI Steps:', result.steps);
    console.log('AI Text:', result.text);

    // Extract tool results from the response steps
    const toolResults: ToolResult[] = [];
    
    if (result.steps) {
      for (const step of result.steps) {
        if (step.toolCalls && step.toolCalls.length > 0) {
          for (const toolCall of step.toolCalls) {
            const tc = toolCall as any;
            toolResults.push({
              toolName: tc.toolName,
              args: tc.args || {},
              result: tc.result || { success: true },
            });
          }
        }
      }
    }

    // If tools were executed but no text was generated, make a second call
    let finalMessage = result.text;
    
    if (!finalMessage && toolResults.length > 0) {
      console.log('Tools executed but no text response. Making follow-up call...');
      
      // Create a summary of what the tools found
      const toolSummary = toolResults.map(tr => {
        if (tr.result.success && tr.result.data) {
          return JSON.stringify(tr.result.data);
        }
        return JSON.stringify(tr.result);
      }).join('\n');
      
      const followUpResult = await generateText({
        model: aiClient(model),
        messages: [
          systemMessage,
          ...conversationHistory,
          {
            role: 'assistant',
            content: `I checked the information using my tools. Here's what I found: ${toolSummary}`,
          },
        ],
        temperature: 0.7,
      });
      
      finalMessage = followUpResult.text || 'I completed your request.';
    } else if (!finalMessage) {
      finalMessage = 'I apologize, but I was unable to generate a response.';
    }

    return {
      message: finalMessage,
      toolResults,
    };
  } catch (error) {
    console.error('Error in processChat:', error);
    
    // If the model doesn't support tools, try without them
    if (error instanceof Error && error.message.includes('model output must contain')) {
      console.log('Model may not support tools, retrying without tools...');
      
      const fallbackResult = await generateText({
        model: aiClient(model),
        messages: [systemMessage, ...conversationHistory],
        temperature: 0.7,
      });
      
      return {
        message: fallbackResult.text || 'I apologize, but I encountered an issue processing your request.',
        toolResults: [],
      };
    }
    
    throw error;
  }
}

