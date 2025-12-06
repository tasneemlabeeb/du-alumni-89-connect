import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Public endpoint to fetch album types
export async function GET() {
  try {
    const albumTypesSnapshot = await adminDb
      .collection('album_types')
      .orderBy('createdAt', 'desc')
      .get();

    const albumTypes = albumTypesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ albumTypes });
  } catch (error) {
    console.error('Error fetching album types:', error);
    return NextResponse.json({ error: 'Failed to fetch album types' }, { status: 500 });
  }
}
