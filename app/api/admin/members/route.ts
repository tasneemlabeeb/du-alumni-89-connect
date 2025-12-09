import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('[Members API] Request received');
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[Members API] No authorization header');
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('[Members API] Token received, verifying...');
    
    // Verify the user is an admin
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
      console.log('[Members API] Token verified for user:', decodedToken.uid);
    } catch (authError: any) {
      console.error('[Members API] Token verification failed:', authError.message);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    const userId = decodedToken.uid;

    // Check if user is admin - check both users and user_roles collections
    console.log('[Members API] Checking admin role for user:', userId);
    
    // First check users collection
    const userDoc = await adminDb.collection('users').doc(userId).get();
    let isAdmin = false;
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      isAdmin = userData?.role === 'admin';
      console.log('[Members API] users collection check - role:', userData?.role, 'isAdmin:', isAdmin);
    }
    
    // Fallback to user_roles collection if not admin yet
    if (!isAdmin) {
      console.log('[Members API] Checking user_roles collection...');
      const userRolesSnapshot = await adminDb
        .collection('user_roles')
        .where('user_id', '==', userId)
        .get();
      console.log('[Members API] Found', userRolesSnapshot.size, 'role(s)');
      isAdmin = userRolesSnapshot.docs.some(doc => doc.data().role === 'admin');
    }
    
    console.log('[Members API] Final admin check result:', isAdmin);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    console.log('[Members API] Fetching members with status:', status);

    console.log('[Members API] Fetching members with status:', status);

    // Fetch members based on status
    let membersSnapshot;
    try {
      console.log('[Members API] Attempting query with orderBy...');
      membersSnapshot = await adminDb
        .collection('members')
        .where('status', '==', status)
        .orderBy('created_at', 'desc')
        .get();
      console.log('[Members API] Query with orderBy successful, found', membersSnapshot.size, 'members');
    } catch (indexError: any) {
      // If composite index is missing, fall back to query without orderBy
      console.warn('[Members API] Composite index may be missing, fetching without orderBy:', indexError.message);
      try {
        membersSnapshot = await adminDb
          .collection('members')
          .where('status', '==', status)
          .get();
        console.log('[Members API] Fallback query successful, found', membersSnapshot.size, 'members');
      } catch (fallbackError: any) {
        console.error('[Members API] Fallback query also failed:', fallbackError.message);
        throw fallbackError;
      }
    }

    let members = membersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
    
    console.log('[Members API] Mapped', members.length, 'members');
    
    // Sort in memory if we couldn't use orderBy
    members.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending order
    });

    console.log('[Members API] Members sorted, fetching profiles...');

    // Get profile details for each member
    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        try {
          const profileDoc = await adminDb
            .collection('profiles')
            .doc(member.user_id)
            .get();

          return {
            ...member,
            profile: profileDoc.exists ? profileDoc.data() : null,
          };
        } catch (error) {
          console.error(`[Members API] Error fetching profile for member ${member.user_id}:`, error);
          return {
            ...member,
            profile: null,
          };
        }
      })
    );

    console.log('[Members API] Returning', membersWithProfiles.length, 'members with profiles');
    
    return NextResponse.json({
      members: membersWithProfiles,
    });
  } catch (error: any) {
    console.error('[Members API] FATAL ERROR:', error);
    console.error('[Members API] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
