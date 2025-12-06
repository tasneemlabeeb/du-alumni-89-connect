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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[Album Types API] No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('[Album Types API] Verifying token...');
    const decodedToken = await adminAuth.verifyIdToken(token);
    console.log('[Album Types API] Token verified for user:', decodedToken.uid);

    // Check admin role in both 'users' and 'user_roles' collections
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRoleDoc = await adminDb.collection('user_roles').doc(decodedToken.uid).get();
    
    const isAdmin = (userDoc.exists && userDoc.data()?.role === 'admin') ||
                    (userRoleDoc.exists && userRoleDoc.data()?.role === 'admin');
    console.log('[Album Types API] Is admin:', isAdmin, '(checked users:', userDoc.exists, 'and user_roles:', userRoleDoc.exists, ')');

    if (!isAdmin) {
      console.error('[Album Types API] User is not admin');
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, order } = body;
    console.log('[Album Types API] Creating album type:', { name, description, order });

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const albumTypeData = {
      name,
      description: description || '',
      order: order || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[Album Types API] Adding to Firestore...');
    const docRef = await adminDb.collection('album_types').add(albumTypeData);
    console.log('[Album Types API] Album type created with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      albumType: { id: docRef.id, ...albumTypeData },
    });
  } catch (error) {
    console.error('[Album Types API] Error creating album type:', error);
    return NextResponse.json({ 
      error: 'Failed to create album type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
