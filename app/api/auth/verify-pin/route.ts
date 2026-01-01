import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();

    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();

    // Normalize email to lowercase for consistency
    const normalizedEmail = email.toLowerCase();

    // Get stored PIN
    const pinDoc = await db.collection('auth_pins').doc(normalizedEmail).get();

    if (!pinDoc.exists) {
      console.error('[PIN Verify] No PIN found for email:', normalizedEmail);
      return NextResponse.json({ error: 'No PIN found for this email' }, { status: 404 });
    }

    const pinData = pinDoc.data();

    // Check if PIN has expired
    if (new Date(pinData.expiresAt) < new Date()) {
      console.error('[PIN Verify] PIN expired for:', normalizedEmail);
      // Delete expired PIN
      await db.collection('auth_pins').doc(normalizedEmail).delete();
      return NextResponse.json({ error: 'PIN has expired. Please request a new one.' }, { status: 400 });
    }

    // Check if PIN matches
    if (pinData.pin !== pin) {
      console.error('[PIN Verify] Invalid PIN for:', normalizedEmail);
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });
    }

    console.log('[PIN Verify] PIN verified successfully for:', normalizedEmail);

    // Mark PIN as verified
    await db.collection('auth_pins').doc(normalizedEmail).update({
      verified: true,
      verifiedAt: new Date().toISOString(),
    });

    // Delete PIN after successful verification (one-time use)
    // Optional: You can keep it for audit purposes
    await db.collection('auth_pins').doc(normalizedEmail).delete();

    return NextResponse.json({ 
      success: true, 
      message: 'PIN verified successfully'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
