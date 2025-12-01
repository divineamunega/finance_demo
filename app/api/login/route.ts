import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { demoUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sign } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const [user] = await db.select().from(demoUsers).where(eq(demoUsers.email, email)).limit(1);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    const signedUserId = await sign(user.id);
    response.cookies.set('session_user_id', signedUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}