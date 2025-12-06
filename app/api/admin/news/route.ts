import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return null;
    }

    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying admin:', error);
    return null;
  }
}

// GET - Fetch all news
export async function GET(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newsSnapshot = await adminDb
      .collection('news')
      .orderBy('created_at', 'desc')
      .get();

    const news = newsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

// POST - Create news
export async function POST(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, summary, published, featured_image_url, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['achievements', 'announcements', 'media_press', 'alumni_stories'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be one of: achievements, announcements, media_press, alumni_stories' }, { status: 400 });
    }

    const newsData = {
      title,
      content,
      summary: summary || '',
      published: published || false,
      featured_image_url: featured_image_url || '',
      category: category || 'announcements', // Default to announcements
      author_id: adminId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('news').add(newsData);

    return NextResponse.json({ 
      id: docRef.id,
      ...newsData 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}

// PUT - Update news
export async function PUT(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('id');

    if (!newsId) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { title, content, summary, published, featured_image_url, category } = body;

    // Validate category if provided
    const validCategories = ['achievements', 'announcements', 'media_press', 'alumni_stories'];
    if (category !== undefined && !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category. Must be one of: achievements, announcements, media_press, alumni_stories' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (published !== undefined) updateData.published = published;
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
    if (category !== undefined) updateData.category = category;

    await adminDb.collection('news').doc(newsId).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

// DELETE - Delete news
export async function DELETE(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newsId = searchParams.get('id');

    if (!newsId) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    await adminDb.collection('news').doc(newsId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
