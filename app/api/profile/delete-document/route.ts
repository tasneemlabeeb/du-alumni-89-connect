import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { getStorage } from "firebase-admin/storage";

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document URL from request body
    const { documentUrl } = await request.json();
    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document URL is required" },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const bucket = getStorage().bucket();
    const bucketName = bucket.name;
    
    // Parse the file path from the public URL
    // Format: https://storage.googleapis.com/{bucket}/{filePath}
    const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;
    
    if (!documentUrl.startsWith(urlPrefix)) {
      return NextResponse.json(
        { error: "Invalid document URL" },
        { status: 400 }
      );
    }

    const filePath = documentUrl.substring(urlPrefix.length);

    // Verify the file belongs to this user
    if (!filePath.startsWith(`documents/${userId}/`)) {
      return NextResponse.json(
        { error: "Unauthorized to delete this document" },
        { status: 403 }
      );
    }

    // Delete file from Storage
    const fileRef = bucket.file(filePath);
    try {
      await fileRef.delete();
    } catch (deleteError: any) {
      // If file doesn't exist, we'll still remove it from Firestore
      if (deleteError.code !== 404) {
        throw deleteError;
      }
    }

    // Update profile in Firestore
    const { db } = getFirebaseAdmin();
    const profileRef = db.collection("profiles").doc(userId);
    const profileDoc = await profileRef.get();

    const currentDocuments = profileDoc.data()?.documents || [];
    const updatedDocuments = currentDocuments.filter(
      (doc: any) => doc.url !== documentUrl
    );

    await profileRef.set({
      documents: updatedDocuments,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
