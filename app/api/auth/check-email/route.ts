import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();
    const { auth: adminAuth } = getFirebaseAdmin();

    try {
      await adminAuth.getUserByEmail(normalizedEmail);
      return NextResponse.json({ exists: true });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return NextResponse.json({ exists: false });
      }
      console.error('[Check Email] Firebase error:', error.code, error.message);
      return NextResponse.json({ error: 'Error checking email' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[Check Email] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
