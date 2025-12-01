import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/accounts?user_id=<uuid>
 * Returns all accounts for a specific user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user_id from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    // Validate user_id parameter
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'user_id parameter is required',
        },
        { status: 400 }
      );
    }

    // Fetch accounts for the specified user
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return NextResponse.json({
      success: true,
      data: userAccounts,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch accounts',
      },
      { status: 500 }
    );
  }
}
