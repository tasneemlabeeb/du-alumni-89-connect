import * as dotenv from 'dotenv';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAdminAPI() {
  try {
    console.log('Initializing Firebase Admin...');
    
    if (getApps().length === 0) {
      const firebaseAdminConfig = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };
      
      initializeApp({
        credential: cert(firebaseAdminConfig),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    const auth = getAuth();
    
    // Get the admin user (from test results, we know there's one admin)
    console.log('\nGetting admin user token...');
    const adminEmail = 'admin@duaab89.com';
    
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(adminEmail);
      console.log('Found admin user:', adminUser.uid);
    } catch (error: any) {
      console.error('Admin user not found:', error.message);
      console.log('\nPlease make sure the admin user exists with email:', adminEmail);
      process.exit(1);
    }
    
    // Create a custom token for testing
    const customToken = await auth.createCustomToken(adminUser.uid);
    console.log('Created custom token');
    
    // Exchange custom token for ID token (this would normally be done client-side)
    const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const tokenResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      }
    );
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to exchange token: ${error}`);
    }
    
    const tokenData = await tokenResponse.json();
    const idToken = tokenData.idToken;
    console.log('Got ID token');
    
    // Call the admin API
    console.log('\nCalling /api/admin/members?status=pending...\n');
    const response = await fetch('http://localhost:3000/api/admin/members?status=pending', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\nResponse body:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API call successful!');
      console.log('Found', data.members?.length || 0, 'pending members');
    } else {
      console.log('\n❌ API call failed with status:', response.status);
    }
    
    process.exit(0);
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testAdminAPI();
