/**
 * Migrate all member data from 'members' collection to 'profiles' collection
 * with proper field name mapping
 */

import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const db = getFirestore();

interface MemberData {
  user_id: string;
  email: string;
  full_name: string;
  nick_name?: string;
  department?: string;
  hall?: string;
  profession?: string;
  date_of_birth?: string;
  phone?: string;
  blood_group?: string;
  present_address?: string;
  home_district?: string;
  status?: string;
  batch?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProfileData {
  userId: string;
  email: string;
  fullName: string;
  nickName: string;
  department: string;
  hall: string;
  faculty: string;
  bloodGroup: string;
  profession: string;
  maritalStatus: string;
  children: string;
  presentAddress: string;
  permanentAddress: string;
  city: string;
  country: string;
  presentCityOfLiving: string;
  biography: string;
  contactNo: string;
  dateOfBirth: string;
  homeDistrict: string;
  batch: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map member data to profile data with correct field names
 */
function mapMemberToProfile(member: MemberData): ProfileData {
  return {
    userId: member.user_id,
    email: member.email,
    fullName: member.full_name,
    nickName: member.nick_name || '',
    department: member.department || '',
    hall: member.hall || '',
    faculty: '', // Not in original data
    bloodGroup: member.blood_group || '',
    profession: member.profession || '',
    maritalStatus: '', // Not in original data
    children: '', // Not in original data
    presentAddress: member.present_address || '',
    permanentAddress: '', // Use home district as permanent address info
    city: '', // Not in original data
    country: 'Bangladesh', // Default
    presentCityOfLiving: '', // Not in original data
    biography: '', // Not in original data
    contactNo: member.phone || '',
    dateOfBirth: member.date_of_birth || '',
    homeDistrict: member.home_district || '',
    batch: member.batch || '1989',
    createdAt: member.created_at || new Date().toISOString(),
    updatedAt: member.updated_at || new Date().toISOString(),
  };
}

async function migrateData() {
  try {
    console.log('🚀 Starting migration from members to profiles...\n');
    console.log('='.repeat(70));
    
    // Get all members
    const membersSnapshot = await db.collection('members').get();
    console.log(`\n📊 Found ${membersSnapshot.size} members to migrate\n`);
    
    if (membersSnapshot.size === 0) {
      console.log('❌ No members found to migrate!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ email: string; error: string }> = [];
    
    // Process each member
    for (const doc of membersSnapshot.docs) {
      const memberData = doc.data() as MemberData;
      
      try {
        console.log(`[${successCount + errorCount + 1}/${membersSnapshot.size}] Migrating: ${memberData.email}`);
        
        // Map to profile format
        const profileData = mapMemberToProfile(memberData);
        
        // Write to profiles collection using the same user_id as document ID
        await db.collection('profiles').doc(memberData.user_id).set(profileData, { merge: true });
        
        console.log(`   ✅ Migrated successfully`);
        successCount++;
        
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
        errors.push({ email: memberData.email, error: error.message });
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 MIGRATION SUMMARY\n');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Failed migrations:');
      errors.forEach(e => {
        console.log(`   - ${e.email}: ${e.error}`);
      });
    }
    
    console.log('\n✅ Migration completed!\n');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the migration
migrateData()
  .then(() => {
    console.log('✨ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
