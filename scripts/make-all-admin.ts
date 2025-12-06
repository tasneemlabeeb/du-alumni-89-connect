import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { adminDb } from '../lib/firebase/admin';

async function makeAllAdmin() {
  try {
    console.log('👑 Making all users admins...\n');
    
    const usersSnapshot = await adminDb.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      await adminDb.collection('users').doc(doc.id).update({
        role: 'admin',
        updated_at: new Date().toISOString(),
      });
      console.log(`✅ ${data.email} is now admin`);
    }
    
    console.log('\n✅ All users are now admins!');
    console.log('Please refresh your browser and try creating an event again.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

makeAllAdmin().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
