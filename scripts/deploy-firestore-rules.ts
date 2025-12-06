import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

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

async function deployRules() {
  console.log('\n🔧 MANUAL DEPLOYMENT REQUIRED\n');
  console.log('Firebase Admin SDK cannot deploy Firestore rules programmatically.');
  console.log('You need to deploy them manually through the Firebase Console.\n');
  
  console.log('📋 STEPS TO DEPLOY:\n');
  console.log('1. Go to: https://console.firebase.google.com/project/duaab89-67c12/firestore/rules');
  console.log('2. Copy the rules from firestore.rules file');
  console.log('3. Paste them in the Firebase Console editor');
  console.log('4. Click the "Publish" button\n');
  
  console.log('OR use this direct link:');
  console.log('https://console.firebase.google.com/project/duaab89-67c12/firestore/rules\n');
  
  console.log('📝 Current rules in your firestore.rules file:\n');
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  console.log(rules);
}

deployRules();
