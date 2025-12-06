import { adminDb } from '../lib/firebase/admin';

async function checkImages() {
  try {
    console.log('Checking news and events for featured images...\n');

    // Check news
    const newsSnapshot = await adminDb.collection('news').get();
    console.log(`📰 Found ${newsSnapshot.size} news items:`);
    newsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n  ID: ${doc.id}`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Published: ${data.published}`);
      console.log(`  Featured Image: ${data.featured_image_url || 'NONE'}`);
    });

    // Check events
    console.log('\n\n🎉 Checking events:');
    const eventsSnapshot = await adminDb.collection('events').get();
    console.log(`Found ${eventsSnapshot.size} events:`);
    eventsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n  ID: ${doc.id}`);
      console.log(`  Title: ${data.title}`);
      console.log(`  Published: ${data.published}`);
      console.log(`  Featured Image: ${data.featured_image_url || 'NONE'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkImages();
