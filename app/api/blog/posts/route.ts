import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { Query } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'approved';

    console.log('[Blog Posts API] Fetching posts - category:', category, 'status:', status);

    let query: Query = adminDb.collection('blog_posts');

    // Filter by status (default to approved for public access)
    query = query.where('status', '==', status);

    // Filter by category if provided
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Try to order by creation date, fall back if index doesn't exist
    let snapshot;
    try {
      query = query.orderBy('created_at', 'desc');
      snapshot = await query.get();
      console.log('[Blog Posts API] Query with orderBy successful');
    } catch (indexError) {
      console.warn('[Blog Posts API] OrderBy failed, fetching without orderBy:', indexError);
      // Retry without orderBy
      query = adminDb.collection('blog_posts');
      query = query.where('status', '==', status);
      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }
      snapshot = await query.get();
    }

    console.log('[Blog Posts API] Found', snapshot.size, 'posts');

    // Filter published posts in memory to avoid composite index requirement
    let posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // For approved posts, only show published ones
    if (status === 'approved') {
      posts = posts.filter((post: any) => post.published === true);
    }

    // Sort in memory
    posts.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending order
    });

    console.log('[Blog Posts API] Returning', posts.length, 'posts');

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
