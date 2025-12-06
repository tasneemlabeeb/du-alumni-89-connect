import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Public endpoint to fetch collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumTypeId = searchParams.get('albumTypeId');

    let collectionsQuery = adminDb.collection('collections').orderBy('createdAt', 'desc');

    if (albumTypeId) {
      collectionsQuery = adminDb.collection('collections')
        .where('albumTypeId', '==', albumTypeId)
        .orderBy('createdAt', 'desc') as any;
    }

    const collectionsSnapshot = await collectionsQuery.get();

    const collections = await Promise.all(
      collectionsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get photo count
        const photosSnapshot = await adminDb
          .collection('photos')
          .where('collectionId', '==', doc.id)
          .get();
        
        // Get first photo as thumbnail
        let thumbnail = '';
        if (photosSnapshot.size > 0) {
          thumbnail = photosSnapshot.docs[0].data().url;
        }

        return {
          id: doc.id,
          ...data,
          photoCount: photosSnapshot.size,
          thumbnail,
        };
      })
    );
    
    // Sort by order field in memory
    collections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
