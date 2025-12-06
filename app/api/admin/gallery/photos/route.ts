import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { uploadToR2 } from '@/lib/cloudflare/r2';

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

    const photosSnapshot = await adminDb
      .collection('photos')
      .orderBy('createdAt', 'desc')
      .get();

    const photos = await Promise.all(
      photosSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        
        // Get collection name
        let collectionName = '';
        if (data.collectionId) {
          const collectionDoc = await adminDb.collection('collections').doc(data.collectionId).get();
          if (collectionDoc.exists) {
            collectionName = collectionDoc.data()?.name || '';
          }
        }

        return {
          id: doc.id,
          ...data,
          collectionName,
        };
      })
    );

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const collectionId = formData.get('collectionId') as string;
    const caption = formData.get('caption') as string;

    if (!file || !collectionId) {
      return NextResponse.json({ error: 'File and collection ID are required' }, { status: 400 });
    }

    // Verify collection exists
    const collectionDoc = await adminDb.collection('collections').doc(collectionId).get();
    if (!collectionDoc.exists) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const fileName = `gallery/${collectionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    const imageUrl = await uploadToR2(buffer, fileName, file.type);

    // Save to Firestore
    const photoData = {
      collectionId,
      url: imageUrl,
      caption: caption || '',
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('photos').add(photoData);

    // Update collection photo count
    const photosCount = await adminDb
      .collection('photos')
      .where('collectionId', '==', collectionId)
      .get();
    
    await adminDb.collection('collections').doc(collectionId).update({
      photoCount: photosCount.size,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      photo: { id: docRef.id, ...photoData },
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
