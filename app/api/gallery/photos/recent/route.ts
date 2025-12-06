import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Public endpoint to fetch recent photos (last 10)
export async function GET() {
  try {
    const photosSnapshot = await adminDb
      .collection('photos')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const photos = photosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching recent photos:', error);
    return NextResponse.json({ error: 'Failed to fetch recent photos' }, { status: 500 });
  }
}
