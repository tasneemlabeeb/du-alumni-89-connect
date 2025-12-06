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

// GET - Fetch all events
export async function GET(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventsSnapshot = await adminDb
      .collection('events')
      .orderBy('created_at', 'desc')
      .get();

    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      event_date, 
      event_end_date,
      location,
      location_url,
      featured_image_url,
      published,
      registration_form
    } = body;

    console.log('[Events API] Creating event with data:', {
      title,
      description,
      event_date,
      event_end_date,
      location,
      published,
      has_registration: !!registration_form
    });

    if (!title || !description || !event_date) {
      return NextResponse.json({ 
        error: 'Title, description, and event date are required' 
      }, { status: 400 });
    }

    const eventData = {
      title,
      description,
      event_date,
      event_end_date: event_end_date || '',
      location: location || '',
      location_url: location_url || '',
      featured_image_url: featured_image_url || '',
      published: published || false,
      registration_form: registration_form || null,
      organizer_id: adminId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('events').add(eventData);
    console.log('[Events API] Event created successfully with ID:', docRef.id);

    return NextResponse.json({ 
      id: docRef.id,
      ...eventData 
    }, { status: 201 });
  } catch (error) {
    console.error('[Events API] Error creating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      event_date,
      event_end_date,
      location,
      location_url,
      featured_image_url,
      published,
      registration_form
    } = body;

    console.log('[Events API] Updating event:', eventId, {
      title,
      description,
      event_date,
      published,
      has_registration: !!registration_form
    });

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (event_date !== undefined) updateData.event_date = event_date;
    if (event_end_date !== undefined) updateData.event_end_date = event_end_date;
    if (location !== undefined) updateData.location = location;
    if (location_url !== undefined) updateData.location_url = location_url;
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
    if (published !== undefined) updateData.published = published;
    if (registration_form !== undefined) updateData.registration_form = registration_form;

    await adminDb.collection('events').doc(eventId).update(updateData);
    console.log('[Events API] Event updated successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Events API] Error updating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const adminId = await verifyAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    await adminDb.collection('events').doc(eventId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
