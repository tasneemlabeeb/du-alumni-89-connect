import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check admin role in both 'users' and 'user_roles' collections
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRoleDoc = await adminDb.collection('user_roles').doc(decodedToken.uid).get();
    
    const isAdmin = (userDoc.exists && userDoc.data()?.role === 'admin') ||
                    (userRoleDoc.exists && userRoleDoc.data()?.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const collectionsSnapshot = await adminDb
      .collection('collections')
      .orderBy('createdAt', 'desc')
      .get();

    const collections = await Promise.all(
      collectionsSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get photo count
        const photosSnapshot = await adminDb
          .collection('photos')
          .where('collectionId', '==', doc.id)
          .get();
        
        // Get album type name
        let albumTypeName = '';
        if (data.albumTypeId) {
          const albumTypeDoc = await adminDb.collection('album_types').doc(data.albumTypeId).get();
          if (albumTypeDoc.exists) {
            albumTypeName = albumTypeDoc.data()?.name || '';
          }
        }

        return {
          id: doc.id,
          ...data,
          photoCount: photosSnapshot.size,
          albumTypeName,
        };
      })
    );

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check admin role in both 'users' and 'user_roles' collections
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRoleDoc = await adminDb.collection('user_roles').doc(decodedToken.uid).get();
    
    const isAdmin = (userDoc.exists && userDoc.data()?.role === 'admin') ||
                    (userRoleDoc.exists && userRoleDoc.data()?.role === 'admin');

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { albumTypeId, name, description, order } = body;

    if (!name || !albumTypeId) {
      return NextResponse.json({ error: 'Name and album type are required' }, { status: 400 });
    }

    // Verify album type exists
    const albumTypeDoc = await adminDb.collection('album_types').doc(albumTypeId).get();
    if (!albumTypeDoc.exists) {
      return NextResponse.json({ error: 'Album type not found' }, { status: 404 });
    }

    const collectionData = {
      albumTypeId,
      name,
      description: description || '',
      order: order || 0,
      photoCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('collections').add(collectionData);

    return NextResponse.json({
      success: true,
      collection: { id: docRef.id, ...collectionData },
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}
