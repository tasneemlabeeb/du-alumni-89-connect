import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = getFirebaseAdmin();
    const profileDoc = await db.collection('profiles').doc(userId).get();

    if (!profileDoc.exists) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    return NextResponse.json({ profile: profileDoc.data() }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { db } = getFirebaseAdmin();

    // Check if mandatory fields are filled
    const mandatoryFieldsFilled = !!(
      body.fullName &&
      body.nickName &&
      body.department &&
      body.hall &&
      body.contactNo &&
      body.bloodGroup
    );

    // Prepare profile data
    const profileData = {
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    };

    // Check if profile exists
    const profileRef = db.collection('profiles').doc(userId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      // Create new profile
      profileData.createdAt = new Date().toISOString();
      await profileRef.set(profileData);
    } else {
      // Update existing profile
      await profileRef.update(profileData);
    }

    // Update user's profile_complete status
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        profile_complete: mandatoryFieldsFilled,
        updated_at: new Date().toISOString(),
      });
    }

    // Also update member record if it exists
    const memberRef = db.collection('members').doc(userId);
    const memberDoc = await memberRef.get();
    
    if (memberDoc.exists) {
      // Update member's basic info
      await memberRef.update({
        full_name: body.fullName || memberDoc.data()?.full_name,
        email: body.email || memberDoc.data()?.email,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: mandatoryFieldsFilled 
        ? 'Profile saved successfully' 
        : 'Profile saved. Please complete all mandatory fields.',
      profile: profileData,
      profileComplete: mandatoryFieldsFilled
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
