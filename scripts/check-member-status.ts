import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const db = getFirestore();

async function checkMemberStatus() {
  console.log('🔍 Checking member status in database...\n');
  
  const snapshot = await db.collection('members').get();
  console.log(`📊 Total members in database: ${snapshot.size}\n`);
  
  const statusCounts: Record<string, number> = {};
  const membersByStatus: Record<string, any[]> = {};
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const status = data.status || 'no-status';
    
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    
    if (!membersByStatus[status]) {
      membersByStatus[status] = [];
    }
    
    membersByStatus[status].push({
      email: data.email,
      fullName: data.full_name,
      createdAt: data.created_at,
    });
  });
  
  console.log('📈 Members by status:');
  console.log('='.repeat(70));
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} members`);
  });
  
  console.log('\n📋 Sample members from each status:');
  console.log('='.repeat(70));
  Object.entries(membersByStatus).forEach(([status, members]) => {
    console.log(`\n🏷️  Status: "${status}" (${members.length} total)`);
    members.slice(0, 3).forEach((member, i) => {
      console.log(`   ${i + 1}. ${member.email} - ${member.fullName}`);
    });
    if (members.length > 3) {
      console.log(`   ... and ${members.length - 3} more`);
    }
  });
  
  console.log('\n✅ Done!\n');
}

checkMemberStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
