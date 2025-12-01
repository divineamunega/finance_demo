 'use server';

import { redirect } from 'next/navigation';
import { sign } from '@/lib/session';
import { cookies } from 'next/headers';

export async function signInAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const password = formData.get('password') as string;

  if (!userId || !password) {
    redirect('/login?error=missing');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    redirect('/login?error=invalid');
  }

  // Set cookie
  (await cookies()).set('session_user_id', await sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect('/');
}
