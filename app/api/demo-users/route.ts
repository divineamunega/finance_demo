import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { demoUsers } from '@/db/schema';

/**
 * GET /api/demo-users
 * Returns all demo users with id, name, email, and avatar
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all demo users from database
    const users = await db.select({
      id: demoUsers.id,
      name: demoUsers.name,
      email: demoUsers.email,
      avatar: demoUsers.avatar,
    }).from(demoUsers);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching demo users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch demo users',
      },
      { status: 500 }
    );
  }
}
