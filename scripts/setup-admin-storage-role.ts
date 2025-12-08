import { db } from '../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function setupAdminRole() {
  const adminEmail = 'admin@duaab89.com';
  // This is the UID from your login - we need to get it from Firebase Auth
  
  console.log('🔍 Checking user_roles collection...');
  
  // Common admin UIDs - replace with your actual UID
  const possibleAdminUIDs = [
    'bCuW2JEWuqZ40X5kbtXGaPb0xfG2', // From your error logs
  ];
  
  for (const uid of possibleAdminUIDs) {
    console.log(`\n📋 Checking UID: ${uid}`);
    
    const roleRef = doc(db, 'user_roles', uid);
    const roleDoc = await getDoc(roleRef);
    
    if (roleDoc.exists()) {
      console.log('✅ Role exists:', roleDoc.data());
    } else {
      console.log('❌ No role found. Creating admin role...');
      await setDoc(roleRef, {
        role: 'admin',
        email: adminEmail,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Admin role created!');
    }
  }
  
  console.log('\n🎯 Done! Try uploading again.');
}

setupAdminRole().catch(console.error);
