require('dotenv').config({path: '.env.local'});
console.log('Firebase Admin Env Check:');
console.log('Project ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
console.log('Private Key length:', process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length);
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
