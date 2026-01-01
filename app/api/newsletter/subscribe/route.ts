import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Check if already subscribed
    const subscribersRef = collection(db, 'subscribers');
    const q = query(subscribersRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    // Add new subscriber
    await addDoc(subscribersRef, {
      email: email.toLowerCase(),
      subscribedAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Successfully subscribed' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
