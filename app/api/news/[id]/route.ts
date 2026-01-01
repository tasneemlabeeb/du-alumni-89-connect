import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'News ID is required' },
        { status: 400 }
      );
    }

    const newsDoc = await adminDb.collection('news').doc(id).get();

    if (!newsDoc.exists) {
      return NextResponse.json(
        { error: 'News item not found' },
        { status: 404 }
      );
    }

    const newsData = newsDoc.data();

    // Only return published news for public access
    if (!newsData?.published) {
      return NextResponse.json(
        { error: 'News item not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: newsDoc.id,
      ...newsData,
    });
  } catch (error) {
    console.error('Error fetching news item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
