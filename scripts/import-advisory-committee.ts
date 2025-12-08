import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

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
  });
}

const db = getFirestore();

// Advisory Committee Members Data
const advisoryCommitteeMembers = [
  { name: 'Dr. Shariful Islam Dulu', position: 'Member', department: 'Marketing', order: 1 },
  { name: 'Ziauddin Ahamed Rintu', position: 'Member', department: 'Bangla', order: 2 },
  { name: 'Md.Ataur Rahman Khan', position: 'Member', department: 'Applied Chemistry', order: 3 },
  { name: 'Md.Asaf Kabir Chowdhury', position: 'Member', department: 'Accounting', order: 4 },
  { name: 'ATM Zafrul Alam', position: 'Member', department: 'Pharmacy', order: 5 },
  { name: 'Asfiquzzaman Aktar', position: 'Member', department: 'Physics', order: 6 },
  { name: 'Abu Horaira Biplob', position: 'Member', department: 'Public Administration', order: 7 },
  { name: 'Abdul Quader Bhuyian Jewel', position: 'Member', department: 'Finance', order: 8 },
  { name: 'Azaharul Haque Mukul', position: 'Member', department: 'Marketing', order: 9 },
  { name: 'Shamsuzzaman Mehedi', position: 'Member', department: 'Sociologgy', order: 10 },
  { name: 'Hasim Ahmed Nipu', position: 'Member', department: 'History', order: 11 },
  { name: 'Mirza Md. Anisur Rahman Kanon', position: 'Member', department: 'History', order: 12 },
  { name: 'Khaleduzzaman Jewel', position: 'Member', department: 'Soil Science', order: 13 },
  { name: 'Zakir Siddique', position: 'Member', department: 'Political Science', order: 14 },
  { name: 'Md.Safiuzzaman', position: 'Member', department: 'Mathematics', order: 15 },
  { name: 'Rezaul Karim', position: 'Member', department: 'History', order: 16 },
  { name: 'Md. Mahbubur Rashid', position: 'Member', department: 'Sociologgy', order: 17 },
];

async function importAdvisoryCommittee() {
  try {
    console.log('🚀 Starting Advisory Committee import...\n');

    // Step 1: Create the Advisory Committee
    console.log('📋 Creating Advisory Committee...');
    const committeeRef = await db.collection('committees').add({
      name: 'Advisory Committee',
      type: 'current',
      order: 1,
      createdAt: new Date(),
    });

    console.log('✅ Committee created with ID:', committeeRef.id);

    // Step 2: Add all members
    console.log('\n👥 Adding committee members...');
    let successCount = 0;
    let errorCount = 0;

    for (const member of advisoryCommitteeMembers) {
      try {
        await db.collection('committees')
          .doc(committeeRef.id)
          .collection('members')
          .add({
            ...member,
            createdAt: new Date(),
          });
        
        successCount++;
        process.stdout.write(`\r✓ Added ${successCount}/${advisoryCommitteeMembers.length} members`);
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error adding ${member.name}:`, error);
      }
    }

    console.log('\n\n✅ Import completed!');
    console.log(`   - Committee: Advisory Committee`);
    console.log(`   - Members added: ${successCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`\n🎉 All done! Visit /committee page to see the results.`);

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

// Run the import
importAdvisoryCommittee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
