import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

import { adminDb } from '../lib/firebase/admin';

async function listAdminAccounts() {
  try {
    console.log('🔍 Checking for admin accounts...\n');
    
    // Get all users with admin role
    const usersSnapshot = await adminDb
      .collection('users')
      .where('role', '==', 'admin')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No admin accounts found!\n');
      console.log('To create an admin account, you can:');
      console.log('1. Run: npx tsx scripts/create-admin.ts');
      console.log('2. Or manually set a user as admin using Firebase Console\n');
      return;
    }

    console.log(`✅ Found ${usersSnapshot.size} admin account(s):\n`);
    console.log('═'.repeat(70));
    
    let index = 0;
    usersSnapshot.forEach((doc) => {
      index++;
      const data = doc.data();
      console.log(`\n${index}. Admin Account:`);
      console.log('   ├─ User ID:', doc.id);
      console.log('   ├─ Email:', data.email || 'N/A');
      console.log('   ├─ Name:', data.full_name || data.name || 'N/A');
      console.log('   ├─ Role:', data.role);
      console.log('   ├─ Status:', data.approval_status || 'N/A');
      console.log('   ├─ Created:', data.created_at || 'N/A');
      console.log('   └─ Updated:', data.updated_at || 'N/A');
    });
    
    console.log('\n' + '═'.repeat(70) + '\n');
    
  } catch (error: any) {
    console.error('❌ Error checking admin accounts:', error.message);
    process.exit(1);
  }
}

listAdminAccounts()
  .then(() => {
    console.log('✅ Check completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
