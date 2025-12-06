import { adminDb } from '@/lib/firebase/admin';

async function checkAdminUsers() {
  try {
    console.log('Checking for admin users...');
    
    const usersSnapshot = await adminDb.collection('users').get();
    
    console.log(`\nTotal users in database: ${usersSnapshot.size}`);
    console.log('\nAll users:');
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nUser ID: ${doc.id}`);
      console.log(`Email: ${data.email || 'N/A'}`);
      console.log(`Role: ${data.role || 'N/A'}`);
      console.log(`Name: ${data.full_name || data.name || 'N/A'}`);
      console.log(`Status: ${data.approval_status || 'N/A'}`);
    });
    
    // Check for admin users
    const adminSnapshot = await adminDb.collection('users').where('role', '==', 'admin').get();
    console.log(`\n\n=== ADMIN USERS FOUND: ${adminSnapshot.size} ===`);
    
    if (adminSnapshot.size === 0) {
      console.log('\n⚠️  No admin users found! You need to set a user as admin.');
      console.log('To make a user admin, run:');
      console.log('npm run set-admin <user-email>');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminUsers();
