import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user is an approved member
    const memberDoc = await adminDb.collection('members').doc(userId).get();
    const member = memberDoc.data();

    if (!member || member.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved members can submit blog posts' },
        { status: 403 }
      );
    }

    // Get user profile for author information
    const profileDoc = await adminDb.collection('profiles').doc(userId).get();
    const profile = profileDoc.data();

    console.log('[Blog Submit] User ID:', userId);
    console.log('[Blog Submit] Member data:', member);
    console.log('[Blog Submit] Profile data:', profile);

    // Get author name from profile or member data
    const authorName = profile?.display_name || 
                      profile?.full_name || 
                      member?.full_name || 
                      member?.name || 
                      'Anonymous';
    
    const authorDepartment = profile?.department || 
                            member?.department || 
                            null;

    console.log('[Blog Submit] Author name:', authorName);
    console.log('[Blog Submit] Author department:', authorDepartment);

    const body = await request.json();
    const { title, content, excerpt, category, featured_image_url } = body;

    if (!title || !content || !excerpt || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['campus-memories', 'published-articles', 'talent-hub'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const blogPostData = {
      title,
      content,
      excerpt,
      category,
      featured_image_url: featured_image_url || null,
      author_id: userId,
      author_name: authorName,
      author_department: authorDepartment,
      status: 'pending', // pending, approved, rejected
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('blog_posts').add(blogPostData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Blog post submitted for review',
    });
  } catch (error) {
    console.error('Error submitting blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
