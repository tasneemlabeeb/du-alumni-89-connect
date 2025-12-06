import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    console.log('[Members Public API] Fetching approved members...');

    // Fetch only approved members
    let membersSnapshot;
    try {
      console.log('[Members Public API] Attempting query with orderBy...');
      membersSnapshot = await adminDb
        .collection('members')
        .where('status', '==', 'approved')
        .orderBy('created_at', 'desc')
        .get();
      console.log('[Members Public API] Query successful, found', membersSnapshot.size, 'approved members');
    } catch (indexError) {
      // If composite index is missing, fall back to query without orderBy
      console.warn('[Members Public API] Composite index may be missing, fetching without orderBy');
      membersSnapshot = await adminDb
        .collection('members')
        .where('status', '==', 'approved')
        .get();
      console.log('[Members Public API] Fallback query successful, found', membersSnapshot.size, 'approved members');
    }

    let members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in memory if we couldn't use orderBy
    members.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending order
    });

    console.log('[Members Public API] Members sorted, fetching profiles...');

    // Get profile details for each member
    const membersWithProfiles = await Promise.all(
      members.map(async (member: any) => {
        try {
          const profileDoc = await adminDb
            .collection('profiles')
            .doc(member.user_id)
            .get();

          return {
            id: member.id,
            user_id: member.user_id,
            full_name: member.full_name,
            email: member.email,
            status: member.status,
            created_at: member.created_at,
            profile: profileDoc.exists ? profileDoc.data() : null,
          };
        } catch (error) {
          console.error(
            `[Members Public API] Error fetching profile for member ${member.user_id}:`,
            error
          );
          return {
            id: member.id,
            user_id: member.user_id,
            full_name: member.full_name,
            email: member.email,
            status: member.status,
            created_at: member.created_at,
            profile: null,
          };
        }
      })
    );

    console.log(
      '[Members Public API] Returning',
      membersWithProfiles.length,
      'approved members with profiles'
    );

    return NextResponse.json({
      members: membersWithProfiles,
      count: membersWithProfiles.length,
    });
  } catch (error: any) {
    console.error('[Members Public API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
