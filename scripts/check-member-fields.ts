import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = getFirestore();

async function checkMemberData() {
  console.log('\n👥 Checking member data structure...\n');
  
  const membersSnapshot = await db.collection('members').limit(5).get();
  
  console.log(`Found ${membersSnapshot.size} members\n`);
  
  membersSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Member ID: ${doc.id}`);
    console.log(`Fields:`, Object.keys(data));
    console.log(`Full data:`, JSON.stringify(data, null, 2));
    console.log('---\n');
  });
}

checkMemberData().catch(console.error);
