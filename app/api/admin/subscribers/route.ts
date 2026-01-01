import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(userId).get();
    let isAdmin = false;
    if (userDoc.exists) {
      isAdmin = userDoc.data()?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const subscribersSnapshot = await adminDb.collection('subscribers')
      .orderBy('subscribedAt', 'desc')
      .get();

    const subscribers = subscribersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      subscribedAt: doc.data().subscribedAt?.toDate?.()?.toISOString() || doc.data().subscribedAt,
    }));

    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
