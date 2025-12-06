import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    if (!name || !email || !subject || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['enquiry', 'feedback', 'fundraising'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400 }
      );
    }

    // Save to Firestore
    const contactData = {
      name,
      email,
      subject,
      message,
      type,
      status: 'unread', // unread, read, responded
      created_at: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('contact_submissions').add(contactData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
