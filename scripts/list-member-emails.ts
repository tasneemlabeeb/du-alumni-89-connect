import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin if not already initialized
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

async function listMemberEmails() {
  try {
    console.log('📧 Fetching all member emails...\n');
    console.log('='.repeat(80));
    
    // Fetch all members from Firestore
    const membersSnapshot = await db.collection('members').get();
    
    if (membersSnapshot.empty) {
      console.log('❌ No members found in the database.\n');
      return;
    }

    console.log(`\n✅ Found ${membersSnapshot.size} members\n`);
    console.log('='.repeat(80));
    console.log('\n📋 MEMBER EMAILS:\n');
    
    const emails: string[] = [];
    const membersData: Array<{
      email: string;
      name: string;
      status: string;
      batch?: string;
      department?: string;
    }> = [];

    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      const email = data.email || 'No email';
      const name = data.full_name || data.name || 'Unknown';
      const status = data.status || 'Unknown';
      const batch = data.batch || data.graduation_year || '';
      const department = data.department || '';
      
      if (email !== 'No email') {
        emails.push(email);
      }
      
      membersData.push({
        email,
        name,
        status,
        batch,
        department,
      });
    });

    // Print detailed list
    membersData.forEach((member, index) => {
      console.log(`${index + 1}. ${member.email}`);
      console.log(`   Name: ${member.name}`);
      console.log(`   Status: ${member.status}`);
      if (member.batch) console.log(`   Batch: ${member.batch}`);
      if (member.department) console.log(`   Department: ${member.department}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\n📧 EMAIL ADDRESSES ONLY (comma-separated):\n');
    console.log(emails.join(', '));
    console.log('\n');

    console.log('='.repeat(80));
    console.log('\n📧 EMAIL ADDRESSES (one per line):\n');
    emails.forEach(email => console.log(email));
    console.log('\n');

    console.log('='.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`Total members: ${membersSnapshot.size}`);
    console.log(`Valid emails: ${emails.length}`);
    
    // Count by status
    const statusCounts: Record<string, number> = {};
    membersData.forEach(member => {
      statusCounts[member.status] = (statusCounts[member.status] || 0) + 1;
    });
    
    console.log('\nBy Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('\n='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error fetching member emails:', error);
  } finally {
    process.exit(0);
  }
}

listMemberEmails();
