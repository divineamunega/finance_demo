import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { demoUsers, accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SECRET = process.env.SESSION_SECRET || 'fallback-demo-secret-change-in-production';
const ENCODED_SECRET = new TextEncoder().encode(SECRET);

export { SECRET };

export async function sign(userId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    ENCODED_SECRET,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(userId)
  );
  
  // Convert buffer to base64url
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  return `${userId}.${signatureBase64}`;
}

export async function verify(signed: string): Promise<string | null> {
  try {
    const [userId, signature] = signed.split('.');
    if (!userId || !signature) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      ENCODED_SECRET,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url to buffer
    const signatureBinStr = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureBytes = new Uint8Array(signatureBinStr.length);
    for (let i = 0; i < signatureBinStr.length; i++) {
      signatureBytes[i] = signatureBinStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(userId)
    );

    return isValid ? userId : null;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session_user_id')?.value;
  if (!sessionCookie) return null;

  const userId = await verify(sessionCookie);
  if (!userId) return null;

  try {
    const user = await db.query.demoUsers.findFirst({
      where: eq(demoUsers.id, userId as any),
    });
    return user || null;
  } catch {
    return null;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function getUserWithAccounts() {
  const user = await requireSessionUser();
  const result = await db.query.demoUsers.findFirst({
    where: eq(demoUsers.id, user.id),
    with: {
      accounts: true,
    },
  });
  return result;
}