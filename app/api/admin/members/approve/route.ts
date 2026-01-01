import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';
import { sendApprovalEmail } from '@/lib/email/nodemailer';

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

    // Check if user is admin - check both users and user_roles collections
    const userDoc = await adminDb.collection('users').doc(adminUserId).get();
    let isAdmin = false;
    
    if (userDoc.exists) {
      isAdmin = userDoc.data()?.role === 'admin';
    }
    
    // Fallback to user_roles collection
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

    // Get member ID from request body
    const { memberId } = await request.json();

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

    // Get current user document to check approval status
    const userDocRef = adminDb.collection('users').doc(memberUserId);
    const currentUserDoc = await userDocRef.get();
    
    if (!currentUserDoc.exists) {
      return NextResponse.json(
        { error: 'User document not found' },
        { status: 404 }
      );
    }

    const currentUserData = currentUserDoc.data();
    const approvedByAdmins = currentUserData?.approved_by_admins || [];
    
    // Check if this admin has already approved
    if (approvedByAdmins.includes(adminUserId)) {
      return NextResponse.json(
        { error: 'You have already approved this member' },
        { status: 400 }
      );
    }

    // Add this admin to the approved_by_admins array
    const newApprovedByAdmins = [...approvedByAdmins, adminUserId];
    const approvalCount = newApprovedByAdmins.length;
    
    // Check if we need 2 approvals (or if profile is not complete yet)
    const profileDoc = await adminDb.collection('profiles').doc(memberUserId).get();
    const profileData = profileDoc.data();
    const profileComplete = profileData && !!(
      profileData.fullName &&
      profileData.nickName &&
      profileData.department &&
      profileData.hall &&
      profileData.contactNo &&
      profileData.bloodGroup
    );

    // Only approve if profile is complete AND we have 2 admin approvals
    const shouldApprove = profileComplete && approvalCount >= 2;
    const newStatus = shouldApprove ? 'approved' : 'pending';

    // Delete uploaded documents from storage if being approved
    if (shouldApprove && memberUserId) {
      try {
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
        // Continue with approval even if document deletion fails
      }
    }

    // Update user document
    await userDocRef.update({
      approved_by_admins: newApprovedByAdmins,
      approval_count: approvalCount,
      approval_status: newStatus,
      ...(shouldApprove && {
        approved_at: new Date().toISOString(),
      }),
      updated_at: new Date().toISOString(),
    });

    // Update member status
    await adminDb.collection('members').doc(memberId).update({
      status: newStatus,
      approved_by_admins: newApprovedByAdmins,
      approval_count: approvalCount,
      ...(shouldApprove && {
        approved_at: new Date().toISOString(),
      }),
    });

    // Send approval email if member is fully approved
    if (shouldApprove) {
      try {
        await sendApprovalEmail({
          email: memberData.email,
          fullName: profileData?.fullName || memberData.full_name,
        });
        console.log('Approval email sent to:', memberData.email);
      } catch (emailError: any) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    const message = shouldApprove 
      ? 'Member approved successfully (2 admin approvals received)' 
      : `Approval recorded (${approvalCount}/2 admin approvals). ${profileComplete ? 'Waiting for second admin approval.' : 'Member must also complete mandatory profile fields.'}`;

    return NextResponse.json({
      message,
      memberId,
      approvalCount,
      approved: shouldApprove,
      profileComplete,
    });
  } catch (error: any) {
    console.error('Error approving member:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve member' },
      { status: 500 }
    );
  }
}
