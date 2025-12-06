const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPhotos() {
  console.log('Checking photos in database...\n');
  
  const photosSnapshot = await db.collection('photos').get();
  console.log(`Total photos: ${photosSnapshot.size}\n`);
  
  photosSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Photo ID: ${doc.id}`);
    console.log(`  Collection ID: ${data.collectionId}`);
    console.log(`  URL: ${data.url}`);
    console.log(`  Caption: ${data.caption || 'N/A'}`);
    console.log('');
  });
  
  process.exit(0);
}

checkPhotos().catch(console.error);
