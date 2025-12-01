import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactions } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

/**
 * GET /api/transactions?account_id=<uuid>&page=1&limit=10
 * Returns paginated transactions for a specific account
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate account_id parameter
    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'account_id parameter is required',
        },
        { status: 400 }
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pagination parameters (page >= 1, 1 <= limit <= 100)',
        },
        { status: 400 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch total count of transactions for this account
    const totalResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.accountId, accountId));

    const total = totalResult[0]?.count || 0;

    // Fetch paginated transactions, ordered by date descending (newest first)
    const accountTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: accountTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
      },
      { status: 500 }
    );
  }
}
