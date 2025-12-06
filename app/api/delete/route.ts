import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { deleteFromR2 } from '@/lib/cloudflare/r2';

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { auth } = getFirebaseAdmin();
    
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get file key from query
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('key');

    if (!fileKey) {
      return NextResponse.json({ error: 'No file key provided' }, { status: 400 });
    }

    // Verify user owns this file or is admin
    const { db } = getFirebaseAdmin();
    const userRolesRef = db.collection('user_roles');
    const rolesSnapshot = await userRolesRef.where('user_id', '==', decodedToken.uid).get();
    
    const isAdmin = rolesSnapshot.docs.some(doc => doc.data().role === 'admin');
    const ownsFile = fileKey.includes(decodedToken.uid);

    if (!isAdmin && !ownsFile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from R2
    await deleteFromR2(fileKey);

    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
