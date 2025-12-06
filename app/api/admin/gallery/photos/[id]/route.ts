import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { deleteFromR2 } from '@/lib/cloudflare/r2';

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

    const photoRef = adminDb.collection('photos').doc(params.id);
    const photoDoc = await photoRef.get();

    if (!photoDoc.exists) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const photoData = photoDoc.data();
    const collectionId = photoData?.collectionId;

    // Extract R2 key from URL
    if (photoData?.url) {
      try {
        const url = new URL(photoData.url);
        const key = url.pathname.substring(1); // Remove leading slash
        await deleteFromR2(key);
      } catch (error) {
        console.error('Error deleting from R2:', error);
        // Continue with Firestore deletion even if R2 deletion fails
      }
    }

    // Delete from Firestore
    await photoRef.delete();

    // Update collection photo count
    if (collectionId) {
      const photosCount = await adminDb
        .collection('photos')
        .where('collectionId', '==', collectionId)
        .get();
      
      await adminDb.collection('collections').doc(collectionId).update({
        photoCount: photosCount.size,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
