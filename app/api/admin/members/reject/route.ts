import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';

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
    const userId = decodedToken.uid;

    // Check if user is admin - check both users and user_roles collections
    const userDoc = await adminDb.collection('users').doc(userId).get();
    let isAdmin = false;
    
    if (userDoc.exists) {
      isAdmin = userDoc.data()?.role === 'admin';
    }
    
    // Fallback to user_roles collection
    if (!isAdmin) {
      const userRolesSnapshot = await adminDb
        .collection('user_roles')
        .where('user_id', '==', userId)
        .get();
      isAdmin = userRolesSnapshot.docs.some(doc => doc.data().role === 'admin');
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get member ID and optional reason from request body
    const { memberId, reason } = await request.json();

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Get member document to retrieve user_id
    const memberDoc = await adminDb.collection('members').doc(memberId).get();
    if (!memberDoc.exists) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    const memberData = memberDoc.data();
    const memberUserId = memberData?.user_id;

    // Delete uploaded documents from storage
    if (memberUserId) {
      try {
        const profileDoc = await adminDb.collection('profiles').doc(memberUserId).get();
        const profileData = profileDoc.data();
        
        if (profileData?.documents && Array.isArray(profileData.documents)) {
          const bucket = getStorage().bucket();
          
          // Delete each document file from storage
          for (const doc of profileData.documents) {
            try {
              const bucketName = bucket.name;
              const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;
              
              if (doc.url && doc.url.startsWith(urlPrefix)) {
                const filePath = doc.url.substring(urlPrefix.length);
                const fileRef = bucket.file(filePath);
                await fileRef.delete();
                console.log(`Deleted document: ${filePath}`);
              }
            } catch (deleteError) {
              console.error(`Error deleting document ${doc.name}:`, deleteError);
              // Continue with other deletions even if one fails
            }
          }

          // Remove documents array from profile
          await adminDb.collection('profiles').doc(memberUserId).update({
            documents: [],
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error deleting documents:', error);
        // Continue with rejection even if document deletion fails
      }
    }

    // Update member status to rejected
    await adminDb.collection('members').doc(memberId).update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: userId,
      rejection_reason: reason || null,
    });

    return NextResponse.json({
      message: 'Member rejected successfully',
      memberId,
    });
  } catch (error: any) {
    console.error('Error rejecting member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject member' },
      { status: 500 }
    );
  }
}
