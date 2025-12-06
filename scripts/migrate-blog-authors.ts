import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { adminDb } from '../lib/firebase/admin';

async function migrateBlogAuthors() {
  try {
    console.log('Starting blog author migration...');

    // Get all blog posts
    const blogPostsSnapshot = await adminDb.collection('blog_posts').get();
    
    console.log(`Found ${blogPostsSnapshot.size} blog posts`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const postDoc of blogPostsSnapshot.docs) {
      const post = postDoc.data();
      const postId = postDoc.id;

      try {
        // Skip if author_name is already set and not Anonymous
        if (post.author_name && post.author_name !== 'Anonymous') {
          console.log(`Skipping post ${postId} - already has author: ${post.author_name}`);
          skipped++;
          continue;
        }

        const authorId = post.author_id;
        if (!authorId) {
          console.log(`Skipping post ${postId} - no author_id`);
          skipped++;
          continue;
        }

        console.log(`Updating post ${postId} for author ${authorId}...`);

        // Get member data
        const memberDoc = await adminDb.collection('members').doc(authorId).get();
        const member = memberDoc.data();

        // Get profile data
        const profileDoc = await adminDb.collection('profiles').doc(authorId).get();
        const profile = profileDoc.data();

        // Determine author name
        const authorName = profile?.display_name || 
                          profile?.full_name || 
                          member?.full_name || 
                          member?.name || 
                          'Anonymous';
        
        const authorDepartment = profile?.department || 
                                member?.department || 
                                null;

        console.log(`  Author: ${authorName} (${authorDepartment || 'No department'})`);

        // Update the post
        await adminDb.collection('blog_posts').doc(postId).update({
          author_name: authorName,
          author_department: authorDepartment,
          updated_at: new Date().toISOString(),
        });

        console.log(`  ✓ Updated post ${postId}`);
        updated++;

      } catch (error) {
        console.error(`Error updating post ${postId}:`, error);
        errors++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total: ${blogPostsSnapshot.size}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateBlogAuthors()
  .then(() => {
    console.log('\nMigration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
