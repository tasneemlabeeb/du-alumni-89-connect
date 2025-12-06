import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

// Helper function to verify admin
async function verifyAdmin(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decodedToken = await adminAuth.verifyIdToken(token);
  const userId = decodedToken.uid;

  // Check admin role in both 'users' and 'user_roles' collections
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const userRoleDoc = await adminDb.collection('user_roles').doc(userId).get();
  
  const isAdmin = (userDoc.exists && userDoc.data()?.role === 'admin') ||
                  (userRoleDoc.exists && userRoleDoc.data()?.role === 'admin');

  if (!isAdmin) {
    return null;
  }

  return userId;
}

// GET - Fetch contact submissions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    console.log('[Contact Admin API] Fetching submissions - type:', type, 'status:', status);

    let query = adminDb.collection('contact_submissions');

    if (type && type !== 'all') {
      query = query.where('type', '==', type) as any;
    }

    if (status && status !== 'all') {
      query = query.where('status', '==', status) as any;
    }

    // Try to order by creation date
    let snapshot;
    try {
      query = query.orderBy('created_at', 'desc') as any;
      snapshot = await query.get();
    } catch (indexError) {
      console.warn('[Contact Admin API] OrderBy failed, fetching without orderBy');
      // Retry without orderBy
      query = adminDb.collection('contact_submissions');
      if (type && type !== 'all') {
        query = query.where('type', '==', type) as any;
      }
      if (status && status !== 'all') {
        query = query.where('status', '==', status) as any;
      }
      snapshot = await query.get();
    }

    console.log('[Contact Admin API] Found', snapshot.size, 'submissions');

    let submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in memory
    submissions.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update submission status
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['unread', 'read', 'responded'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await adminDb.collection('contact_submissions').doc(submissionId).update({
      status,
      updated_at: new Date().toISOString(),
      updated_by: adminId,
    });

    return NextResponse.json({
      success: true,
      message: 'Submission status updated successfully',
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a submission
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('contact_submissions').doc(submissionId).delete();

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
