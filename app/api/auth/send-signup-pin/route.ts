import { NextRequest, NextResponse } from 'next/server';
import { sendPinEmail } from '@/lib/email/nodemailer';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a random 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { db } = getFirebaseAdmin();

    // Store PIN in Firestore
    await db.collection('auth_pins').doc(email.toLowerCase()).set({
      pin,
      email: email.toLowerCase(),
      expiresAt,
      verified: false,
      createdAt: new Date().toISOString(),
      type: 'signup', // Mark this as a signup PIN
    });

    console.log('[Signup PIN] Generated PIN for:', email);

    // Try to send email
    let emailSent = false;
    try {
      await sendPinEmail({ email, pin });
      emailSent = true;
      console.log('[Signup PIN] Email sent successfully to:', email);
    } catch (emailError: any) {
      console.error('[Signup PIN] Email send failed:', emailError.message);
      // Continue even if email fails - for development
    }

    // In development, return PIN if email failed
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Verification code sent to your email' 
        : 'Verification code generated',
      ...(isDevelopment && !emailSent && { devPin: pin })
    });
  } catch (error: any) {
    console.error('[Signup PIN] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
