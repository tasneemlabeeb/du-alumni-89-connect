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

// GET - Fetch all blog posts (pending, approved, rejected) for admin review
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('[Blog Admin API] Fetching posts with status:', status);

    let query = adminDb.collection('blog_posts');

    if (status) {
      query = query.where('status', '==', status) as any;
    }

    // Try without orderBy first to avoid index issues
    let snapshot;
    try {
      query = query.orderBy('created_at', 'desc') as any;
      snapshot = await query.get();
      console.log('[Blog Admin API] Query with orderBy successful');
    } catch (indexError) {
      console.warn('[Blog Admin API] OrderBy failed, trying without orderBy:', indexError);
      // Retry without orderBy
      query = adminDb.collection('blog_posts');
      if (status) {
        query = query.where('status', '==', status) as any;
      }
      snapshot = await query.get();
    }
    
    console.log('[Blog Admin API] Found', snapshot.size, 'posts');

    let posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    // Sort in memory if we didn't use orderBy
    posts.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending order
    });
    
    console.log('[Blog Admin API] Returning', posts.length, 'posts');

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts for admin:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Approve or reject a blog post
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, rejection_reason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      published: action === 'approve',
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (action === 'reject' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    await adminDb.collection('blog_posts').doc(postId).update(updateData);

    return NextResponse.json({
      success: true,
      message: `Blog post ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a blog post
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminId = await verifyAdmin(authHeader);

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('blog_posts').doc(postId).delete();

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
