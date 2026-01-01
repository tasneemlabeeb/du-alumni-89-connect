import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { sendPinEmail } from '@/lib/email/nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // If password is provided, verify credentials first
    if (password) {
      try {
        // Verify user exists first (using Admin SDK)
        const { auth: adminAuth } = getFirebaseAdmin();
        await adminAuth.getUserByEmail(normalizedEmail);
        
        // Verify password using Firebase Auth REST API
        // Firebase Admin SDK doesn't have a direct password verification method
        const response = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: normalizedEmail,
              password,
              returnSecureToken: true,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[2FA] Invalid credentials:', errorData.error?.message);
          return NextResponse.json({ 
            error: 'Invalid email or password' 
          }, { status: 401 });
        }

        console.log('[2FA] Credentials verified successfully');
        // Credentials are valid, continue with PIN generation
      } catch (authError: any) {
        console.error('[2FA] Credential verification error:', authError.message);
        return NextResponse.json({ 
          error: 'Invalid email or password' 
        }, { status: 401 });
      }
    }

    // Generate 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { db } = getFirebaseAdmin();

    // Store PIN in Firestore
    await db.collection('auth_pins').doc(normalizedEmail).set({
      pin,
      email: normalizedEmail,
      expiresAt,
      verified: false,
      createdAt: new Date().toISOString(),
    });

    // Send PIN via email
    try {
      await sendPinEmail({ email: normalizedEmail, pin });
      console.log(`[2FA] PIN sent to ${normalizedEmail}`);
      
      // Email sent successfully - don't expose PIN
      return NextResponse.json({ 
        success: true, 
        message: 'PIN sent to your email',
      }, { status: 200 });
    } catch (emailError: any) {
      console.error('[2FA] Email send failed:', emailError.message);
      
      // In development, return PIN in response even if email fails
      if (process.env.NODE_ENV === 'development') {
        console.log(`[2FA] Development mode - PIN for ${normalizedEmail}: ${pin}`);
        return NextResponse.json({ 
          success: true, 
          message: 'Email service error. PIN shown in console for development.',
          devPin: pin,
          emailError: emailError.message,
        }, { status: 200 });
      }
      
      // In production, fail if email can't be sent
      throw new Error('Failed to send verification email. Please try again.');
    }
  } catch (error: any) {
    console.error('Error sending PIN:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
