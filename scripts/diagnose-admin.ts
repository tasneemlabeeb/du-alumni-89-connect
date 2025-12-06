import * as dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });

if (!getApps().length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

const auth = getAuth();
const db = getFirestore();

async function diagnose() {
  try {
    console.log('=== MEMBERS COLLECTION ===\n');
    const membersSnapshot = await db.collection('members').get();
    console.log(`Found ${membersSnapshot.size} members total\n`);

    const byStatus: Record<string, number> = {};
    membersSnapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    console.log('Members by status:');
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\nAll members:');
    membersSnapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`\n  ${i + 1}. ${data.full_name || data.name || 'NO NAME'}`);
      console.log(`     ID: ${doc.id}`);
      console.log(`     Status: ${data.status}`);
      console.log(`     Email: ${data.email}`);
    });

  } catch (error) {
    console.error('ERROR:', error);
  }
}

diagnose();
