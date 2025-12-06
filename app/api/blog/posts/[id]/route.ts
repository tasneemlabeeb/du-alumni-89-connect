import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const postDoc = await adminDb.collection('blog_posts').doc(id).get();

    if (!postDoc.exists) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const postData = postDoc.data();

    // Only return published posts for public access
    if (postData?.status !== 'approved' || !postData?.published) {
      return NextResponse.json(
        { error: 'Blog post not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: postDoc.id,
      ...postData,
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
