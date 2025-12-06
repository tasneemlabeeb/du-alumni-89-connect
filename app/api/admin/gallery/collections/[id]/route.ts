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
    const { albumTypeId, name, description, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const collectionRef = adminDb.collection('collections').doc(params.id);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const updateData = {
      ...(albumTypeId && { albumTypeId }),
      name,
      description: description || '',
      order: order || 0,
      updatedAt: new Date().toISOString(),
    };

    await collectionRef.update(updateData);

    return NextResponse.json({
      success: true,
      collection: { id: params.id, ...updateData },
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
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

    const collectionRef = adminDb.collection('collections').doc(params.id);
    const collectionDoc = await collectionRef.get();

    if (!collectionDoc.exists) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Delete all photos in this collection
    const photosSnapshot = await adminDb
      .collection('photos')
      .where('collectionId', '==', params.id)
      .get();

    const batch = adminDb.batch();
    photosSnapshot.docs.forEach((photoDoc) => {
      batch.delete(photoDoc.ref);
    });

    batch.delete(collectionRef);
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
