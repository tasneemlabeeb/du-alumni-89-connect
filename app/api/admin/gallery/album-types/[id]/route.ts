import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const albumTypeRef = adminDb.collection('album_types').doc(params.id);
    const albumTypeDoc = await albumTypeRef.get();

    if (!albumTypeDoc.exists) {
      return NextResponse.json({ error: 'Album type not found' }, { status: 404 });
    }

    const updateData = {
      name,
      description: description || '',
      order: order || 0,
      updatedAt: new Date().toISOString(),
    };

    await albumTypeRef.update(updateData);

    return NextResponse.json({
      success: true,
      albumType: { id: params.id, ...updateData },
    });
  } catch (error) {
    console.error('Error updating album type:', error);
    return NextResponse.json({ error: 'Failed to update album type' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const albumTypeRef = adminDb.collection('album_types').doc(params.id);
    const albumTypeDoc = await albumTypeRef.get();

    if (!albumTypeDoc.exists) {
      return NextResponse.json({ error: 'Album type not found' }, { status: 404 });
    }

    const collectionsSnapshot = await adminDb
      .collection('collections')
      .where('albumTypeId', '==', params.id)
      .get();

    const batch = adminDb.batch();

    for (const collectionDoc of collectionsSnapshot.docs) {
      const photosSnapshot = await adminDb
        .collection('photos')
        .where('collectionId', '==', collectionDoc.id)
        .get();

      photosSnapshot.docs.forEach((photoDoc) => {
        batch.delete(photoDoc.ref);
      });

      batch.delete(collectionDoc.ref);
    }

    batch.delete(albumTypeRef);
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting album type:', error);
    return NextResponse.json({ error: 'Failed to delete album type' }, { status: 500 });
  }
}
