import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { getStorage } from 'firebase-admin/storage';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const photoType = formData.get('photoType') as string; // 'profile' or 'family'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!photoType || !['profile', 'family'].includes(photoType)) {
      return NextResponse.json({ error: 'Invalid photo type' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG and PNG are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `photos/${userId}/${photoType}-${timestamp}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    const bucket = getStorage().bucket();
    const fileUpload = bucket.file(fileName);
    
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          userId,
          photoType,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Update profile in Firestore with photo URL
    const { db } = getFirebaseAdmin();
    const profileRef = db.collection('profiles').doc(userId);
    
    const updateField = photoType === 'profile' ? 'profilePhotoUrl' : 'familyPhotoUrl';
    await profileRef.set({
      [updateField]: publicUrl,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      url: publicUrl,
      photoType,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload photo' 
    }, { status: 500 });
  }
}
