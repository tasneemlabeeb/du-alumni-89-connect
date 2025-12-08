import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'duaab89-67c12.firebasestorage.app',
  });
}

const db = getFirestore();
const storage = getStorage();

// Previous committees data
const previousCommittees = [
  {
    name: '2015-2016',
    year: '2015-2016',
    pdfPath: '/Users/tasneemzaman/Documents/Contents/Executive Committee of DUAAB_89 for 2015-16.pdf',
  },
  {
    name: '2020-2021',
    year: '2020-2021',
    pdfPath: '/Users/tasneemzaman/Documents/Contents/Executive Committee of DUAAB_89 2020-21.pdf',
  },
];

async function uploadPDFToStorage(localPath: string, fileName: string): Promise<string> {
  try {
    console.log(`   Uploading ${fileName}...`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(localPath);
    
    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(`committee-pdfs/${Date.now()}_${fileName}`);
    
    await file.save(fileBuffer, {
      metadata: {
        contentType: 'application/pdf',
      },
      public: true,
    });
    
    // Get public URL
    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
    
    console.log(`   ✓ Uploaded successfully`);
    return publicUrl;
  } catch (error) {
    console.error(`   ✗ Error uploading ${fileName}:`, error);
    throw error;
  }
}

async function importPreviousCommittees() {
  try {
    console.log('🚀 Starting Previous Committees import...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const committee of previousCommittees) {
      try {
        console.log(`\n📄 Processing: ${committee.name}`);
        
        // Check if PDF file exists
        if (!fs.existsSync(committee.pdfPath)) {
          console.error(`   ✗ PDF file not found: ${committee.pdfPath}`);
          errorCount++;
          continue;
        }

        // Upload PDF to Firebase Storage
        const pdfFileName = path.basename(committee.pdfPath);
        const pdfURL = await uploadPDFToStorage(committee.pdfPath, pdfFileName);

        // Create committee document in Firestore
        console.log(`   Creating committee document...`);
        await db.collection('committees').add({
          name: committee.name,
          type: 'previous',
          year: committee.year,
          pdfURL: pdfURL,
          order: 10 + successCount, // Start at 10 to keep after current committees
          createdAt: new Date(),
        });

        console.log(`   ✅ Successfully added: ${committee.name}`);
        successCount++;

      } catch (error) {
        console.error(`   ✗ Error processing ${committee.name}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Import completed!');
    console.log(`   - Successfully imported: ${successCount} committees`);
    console.log(`   - Errors: ${errorCount}`);
    console.log('='.repeat(50));
    console.log('\n🎉 Visit /committee page to see the previous committees!');

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    process.exit(1);
  }
}

// Run the import
importPreviousCommittees()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
