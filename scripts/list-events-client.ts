import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listEvents() {
  console.log('\n📅 Fetching events using client SDK...\n');
  
  try {
    // Get all events
    const eventsRef = collection(db, 'events');
    const allEventsSnapshot = await getDocs(eventsRef);
    
    console.log(`Total events in database: ${allEventsSnapshot.size}\n`);
    
    if (allEventsSnapshot.empty) {
      console.log('❌ No events found in Firestore!');
      console.log('You need to create some events in the admin panel first.\n');
      return;
    }
    
    console.log('All events:');
    allEventsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n  Event: ${data.title}`);
      console.log(`    ID: ${doc.id}`);
      console.log(`    Published: ${data.published}`);
      console.log(`    Event Date: ${data.event_date}`);
      console.log(`    Location: ${data.location || 'N/A'}`);
    });
    
    // Try to get published events
    console.log('\n\n📋 Fetching PUBLISHED events only...\n');
    const publishedQuery = query(eventsRef, where('published', '==', true));
    const publishedSnapshot = await getDocs(publishedQuery);
    
    console.log(`Published events: ${publishedSnapshot.size}\n`);
    
    if (publishedSnapshot.size === 0) {
      console.log('⚠️  No published events! Make sure to mark events as "published" in the admin panel.');
    } else {
      publishedSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ✅ ${data.title} (${data.event_date})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching events:', error);
  }
}

listEvents();
