import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the user is an admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminUserId = decodedToken.uid;

    // Check if user is admin
    const adminDoc = await adminDb.collection('users').doc(adminUserId).get();
    let isAdmin = false;
    
    if (adminDoc.exists) {
      isAdmin = adminDoc.data()?.role === 'admin';
    }
    
    if (!isAdmin) {
      const userRolesSnapshot = await adminDb
        .collection('user_roles')
        .where('user_id', '==', adminUserId)
        .get();
      isAdmin = userRolesSnapshot.docs.some(doc => doc.data().role === 'admin');
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get target user ID and role from request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Update user role in 'users' collection
    await adminDb.collection('users').doc(userId).update({
      role: role,
      updated_at: new Date().toISOString()
    });

    // Also update in 'user_roles' for backward compatibility if needed
    // First check if it exists
    const userRolesSnapshot = await adminDb
      .collection('user_roles')
      .where('user_id', '==', userId)
      .get();

    if (!userRolesSnapshot.empty) {
      const roleDocId = userRolesSnapshot.docs[0].id;
      await adminDb.collection('user_roles').doc(roleDocId).update({
        role: role
      });
    } else {
      await adminDb.collection('user_roles').add({
        user_id: userId,
        role: role
      });
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error: any) {
    console.error('[Update Role API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
