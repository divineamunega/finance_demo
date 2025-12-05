import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, chatMessages, accounts, transactions, summaries } from '@/db/schema';
import { eq, desc, and, gte, inArray } from 'drizzle-orm';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { requireSessionUser } from '@/lib/session';

/**
 * POST /api/chat
 * 
 * Chat endpoint with OpenAI integration and financial context
 * 
 * Request body:
 * {
 *   user_id: string (UUID),
 *   session_id?: string (UUID, optional - creates new session if not provided),
 *   messages: Array<{ role: 'user' | 'assistant', content: string }>
 * }
 * 
 * Features:
 * - Stores conversation in database
 * - Pulls transaction summaries for context
 * - Uses OpenAI for intelligent responses
 * - Maintains conversation history
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await requireSessionUser();
    const userId = user.id;

    const { session_id, messages } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        {
          success: false,
          error: 'messages array is required',
        },
        { status: 400 }
      );
    }

    // Validate messages format
    if (messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'messages array cannot be empty',
        },
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    if (latestUserMessage.role !== 'user') {
      return NextResponse.json(
        {
          success: false,
          error: 'Last message must be from user',
        },
        { status: 400 }
      );
    }

    // ===== GET OR CREATE CHAT SESSION =====
    let currentSessionId = session_id;
    
    if (!currentSessionId) {
      // Create new session
      const newSession = await db.insert(chatSessions).values({
        userId: userId,
        title: latestUserMessage.content.slice(0, 100), // Use first message as title
      }).returning();
      
      currentSessionId = newSession[0].id;
    } else {
      // Update existing session timestamp
      await db
        .update(chatSessions)
        .set({ updatedAt: new Date() })
        .where(eq(chatSessions.id, currentSessionId));
    }

    // ===== STORE USER MESSAGE =====
    await db.insert(chatMessages).values({
      sessionId: currentSessionId,
      role: 'user',
      content: latestUserMessage.content,
    });

    // ===== FETCH FINANCIAL CONTEXT =====
    // Get user's accounts
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentTransactions: any[] = [];
    if (userAccounts.length > 0) {
      const accountIds = userAccounts.map(a => a.id);
      recentTransactions = await db
        .select()
        .from(transactions)
        .where(
          and(
            inArray(transactions.accountId, accountIds),
            gte(transactions.date, thirtyDaysAgo)
          )
        )
        .orderBy(desc(transactions.date))
        .limit(20);
    }

    // Get latest summary if available
    const latestSummary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.userId, userId))
      .orderBy(desc(summaries.createdAt))
      .limit(1);

    // ===== BUILD CONTEXT FOR AI =====
    const contextParts: string[] = [];

    // Add account information
    if (userAccounts.length > 0) {
      const accountsInfo = userAccounts.map(acc => 
        `${acc.name} (${acc.type}): $${acc.balance}`
      ).join(', ');
      contextParts.push(`User's accounts: ${accountsInfo}`);
    }

    // Add recent transactions summary
    if (recentTransactions.length > 0) {
      const totalSpent = recentTransactions
        .filter(t => parseFloat(t.amount) < 0)
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
      
      const totalIncome = recentTransactions
        .filter(t => parseFloat(t.amount) > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      contextParts.push(
        `Recent activity (last 30 days): ${recentTransactions.length} transactions, ` +
        `$${totalSpent.toFixed(2)} spent, $${totalIncome.toFixed(2)} income`
      );

      // Add top spending categories
      const categoryTotals: Record<string, number> = {};
      recentTransactions
        .filter(t => parseFloat(t.amount) < 0)
        .forEach(t => {
          const amount = Math.abs(parseFloat(t.amount));
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
        });

      const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
        .join(', ');

      if (topCategories) {
        contextParts.push(`Top spending categories: ${topCategories}`);
      }
    }

    // Add latest insights if available
    if (latestSummary.length > 0 && latestSummary[0].insights) {
      contextParts.push(`Recent insights: ${latestSummary[0].insights.slice(0, 200)}...`);
    }

    const financialContext = contextParts.join('\n');

    // ===== PREPARE MESSAGES FOR OPENAI =====
    const systemMessage = {
      role: 'system' as const,
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

    // Include conversation history (last 10 messages for context)
    const conversationHistory = messages.slice(-10).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // ===== CALL AI API =====
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    });

    // Import financial tools
    const { default: financialTools } = await import('@/lib/openai/tools');
    const { executeGetAccountBalance, executeWithdraw, executeTransfer } = await import('@/lib/openai/executeTools');

    // First AI call with tools
    const { text: assistantMessage, toolCalls } = await generateText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
      messages: [systemMessage, ...conversationHistory],
      tools: financialTools.reduce((acc, tool) => {
        acc[tool.function.name] = {
          description: tool.function.description,
          parameters: tool.function.parameters,
        };
        return acc;
      }, {} as any),
      temperature: 0.7,
    });

    let finalMessage = assistantMessage;
    let toolResults: any[] = [];

    // Execute any tool calls
    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        // Type assertion to access tool call properties
        const tc = toolCall as any;
        const toolName = tc.toolName;
        const args = tc.args || {};
        let result;

        try {
          switch (toolName) {
            case 'get_account_balance':
              result = await executeGetAccountBalance(userId, args.accountId);
              break;
            case 'withdraw_money':
              result = await executeWithdraw(userId, args.accountId, args.amount);
              break;
            case 'transfer_money':
              result = await executeTransfer(
                userId,
                args.fromAccountId,
                args.amount,
                args.toAccountId,
                args.recipientEmail,
                args.description
              );
              break;
            default:
              result = { success: false, error: 'Unknown tool' };
          }
        } catch (error) {
          result = {
            success: false,
            error: error instanceof Error ? error.message : 'Tool execution failed',
          };
        }

        toolResults.push({
          toolName,
          args,
          result,
        });
      }



      // Second AI call with tool results to generate final response
      const toolResultMessages = toolResults.map(tr => ({
        role: 'tool' as const,
        content: JSON.stringify(tr.result),
        toolCallId: tr.toolName,
      }));

      const { text: finalResponse } = await generateText({
        model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
        messages: [
          systemMessage,
          ...conversationHistory,
          { role: 'assistant' as const, content: assistantMessage },
          ...toolResultMessages,
        ],
        temperature: 0.7,
      });

      finalMessage = finalResponse || assistantMessage;
    }

    if (!finalMessage) {
      throw new Error('No response from AI');
    }

    // ===== STORE ASSISTANT MESSAGE =====
    const savedMessage = await db.insert(chatMessages).values({
      sessionId: currentSessionId,
      role: 'assistant',
      content: finalMessage,
    }).returning();

    // ===== RETURN RESPONSE =====
    return NextResponse.json({
      success: true,
      data: {
        session_id: currentSessionId,
        message: {
          id: savedMessage[0].id,
          role: 'assistant',
          content: finalMessage,
          createdAt: savedMessage[0].createdAt,
        },
        tool_calls: toolResults.length > 0 ? toolResults : undefined,
        context_used: {
          accounts_count: userAccounts.length,
          recent_transactions_count: recentTransactions.length,
          has_summary: latestSummary.length > 0,
          tools_executed: toolResults.length,
        },
      },
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat?session_id=<uuid>
 *
 * Retrieves chat history for a session. No param lists user's sessions.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const userId = user.id;
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      // Validate session ownership
      const session = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, sessionId))
        .limit(1);

      if (session.length === 0 || session[0].userId !== userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Session not found or unauthorized',
          },
          { status: 404 }
        );
      }

      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);

      return NextResponse.json({
        success: true,
        data: {
          session: session[0],
          messages,
        },
      });
    } else {
      // List all sessions for current user
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.updatedAt));

      return NextResponse.json({
        success: true,
        data: sessions,
      });
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat history',
      },
      { status: 500 }
    );
  }
}
