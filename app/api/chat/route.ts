import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatSessions, chatMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireSessionUser } from '@/lib/session';
import { getFinancialContext, processChat } from '@/lib/ai';

/**
 * POST /api/chat
 * 
 * Chat endpoint with OpenAI integration and financial context
 * 
 * Request body:
 * {
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
    const financialContext = await getFinancialContext(userId);

    // ===== PROCESS WITH AI =====
    const { message: finalMessage, toolResults } = await processChat(
      messages,
      financialContext,
      userId
    );

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
