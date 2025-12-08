import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const db = getFirestore();

// Executive Committee Members Data
const executiveCommitteeMembers = [
  { name: 'Md.Zahid Hossain Bhuiyan', position: 'President', department: 'Economics', order: 1 },
  { name: 'Md. Amjad Ali Rahman Mohoshin', position: 'General Secretary', department: 'Political Science', order: 2 },
  { name: 'Mahbub-Ul-Imam Tomal', position: 'Treasurer', department: 'Mathematics', order: 3 },
  { name: 'Mostafizur Rahman Tapu', position: 'Vice President 1', department: 'Applied Chemistry', order: 4 },
  { name: 'Ujjol Miskath', position: 'Vice President 2', department: 'Zoology', order: 5 },
  { name: 'Shekh Kawsar', position: 'Vice President 3', department: 'Public Administration', order: 6 },
  { name: 'K.M Khaleduzzaman Jewel', position: 'Vice President 4', department: 'Marketing', order: 7 },
  { name: 'Fazlul Haque Munna', position: 'Vice President 5', department: 'Finance', order: 8 },
  { name: 'Ramzan Hossain Chowdhury', position: 'Vice President 6', department: 'Accounting', order: 9 },
  { name: 'Selim Mia', position: 'Vice President 7', department: 'Political Science', order: 10 },
  { name: 'Zavedur Rahman', position: 'Vice President 8', department: 'Sociology', order: 11 },
  { name: 'Aknur Rahman', position: 'Vice President 9', department: 'Pharmacy', order: 12 },
  { name: 'Rupok Singha', position: 'Joint Secretary 1', department: 'Journalism', order: 13 },
  { name: 'Shorab Hossain Hero', position: 'Joint Secretary 2', department: 'History', order: 14 },
  { name: 'Omar Faruk Bablu', position: 'Joint Secretary 3', department: 'Soil Science', order: 15 },
  { name: 'Shahidul Islam Rubel', position: 'Joint Secretary 4', department: 'Pharmacy', order: 16 },
  { name: 'Prof. Serajur Rasul', position: 'Joint Secretary 5', department: 'Management', order: 17 },
  { name: 'Forhana Yeasmin Ruby', position: 'Joint Secretary 6', department: 'Islamic History', order: 18 },
  { name: 'Zakir Hossain', position: 'Joint Secretary 7', department: 'Marketing', order: 19 },
  { name: 'Md. A.Razzak Khan Rana', position: 'Organising Secretary 1', department: 'Accounting', order: 20 },
  { name: 'B.M Yousuf Ali', position: 'Organising Secretary 2', department: 'Political Science', order: 21 },
  { name: 'Muktabur Rahman', position: 'Organising Secretary 3', department: 'History', order: 22 },
  { name: 'Khaled Masud Linkon', position: 'Organising Secretary 4', department: 'Marketing', order: 23 },
  { name: 'Kamrul Hassan Bhuyan', position: 'Organising Secretary 5', department: 'Finance', order: 24 },
  { name: 'Nasimul Aleem Parag', position: 'Organising Secretary 6', department: 'Statistics', order: 25 },
  { name: 'Golam Rabbani Palash', position: 'Organising Secretary 7', department: 'Zoology', order: 26 },
  { name: 'Shaheda Mita', position: 'Organising Secretary 8', department: 'Microbiology', order: 27 },
  { name: 'Lima Khan', position: 'Organising Secretary 9', department: 'Sociology', order: 28 },
  { name: 'Md. Azizul Haque Gazi', position: 'Office Secretary', department: 'Islamic Studies', order: 29 },
  { name: 'Elias Khan', position: 'Press & Publication Secretary', department: 'Journalism & Mass Communication', order: 30 },
  { name: 'Hasina Momotaj Misti Rupa', position: 'Legal & Court Affairs Secretary', department: 'Law', order: 31 },
  { name: 'Jamal Uddin Ahmed', position: 'Social Affairs Secretary', department: 'Economics', order: 32 },
  { name: 'A.K.M Nazmul Haque Nipon', position: 'Sports Secretary', department: 'Zoology', order: 33 },
  { name: 'Shamim Ara Bina', position: 'Cultural Secretary', department: 'Sociology', order: 34 },
  { name: 'Ayesha Siddika Manee', position: 'Women Affairs Secretary', department: 'Philosophy', order: 35 },
  { name: 'Tanzeba Raihan Shoma', position: 'ICT Secretary', department: 'Mathematics', order: 36 },
  { name: 'A.K.M Shoaib', position: 'Tourism & Transport Affairs Secretary', department: 'Management', order: 37 },
  { name: 'Md. Moin Uddin Bachchu', position: 'Health & Hospital Affairs Secretary', department: 'Soil Science', order: 38 },
  { name: 'Md. Delowar Hossain', position: 'Education Secretary', department: 'Bangla', order: 39 },
  { name: 'Fakhrul Abedin Milon', position: 'Environment Affairs Secretary', department: 'Physics', order: 40 },
  { name: 'Nazim Uddin SHISHIM', position: 'Executive Member', department: 'Philosophy', order: 41 },
  { name: 'Md.Abdur Rob', position: 'Executive Member', department: 'Economics', order: 42 },
  { name: 'Tapos Kumar Kundu', position: 'Executive Member', department: 'Marketing', order: 43 },
  { name: 'Ali Akter Tarafdar', position: 'Executive Member', department: 'Journalism & Mass Communication', order: 44 },
  { name: 'Mohammad Mostafa Jamal', position: 'Executive Member', department: 'Geography', order: 45 },
  { name: 'Ruhul Amin', position: 'Executive Member', department: 'Political Science', order: 46 },
  { name: 'Fazle Hossain', position: 'Executive Member', department: 'Sociology', order: 47 },
  { name: 'Md. Motiur Rahman Toru', position: 'Executive Member', department: 'Botany', order: 48 },
  { name: 'A. Taraqqi-A-Kamal', position: 'Executive Member', department: 'Soil Science', order: 49 },
  { name: 'S.M Shariar Rahman', position: 'Executive Member', department: 'Philosophy', order: 50 },
  { name: 'Sohel Omitav', position: 'Executive Member', department: 'Finance', order: 51 },
  { name: 'Razia Ferdousi Shampa', position: 'Executive Member', department: 'Economics', order: 52 },
  { name: 'Amit Kumar Dam', position: 'Executive Member', department: 'Soil Science', order: 53 },
  { name: 'Miron Kumar Mondol', position: 'Executive Member', department: 'Sociology', order: 54 },
  { name: 'Polok Poddar', position: 'Executive Member', department: 'Sociology', order: 55 },
  { name: 'Mainul J Chowdhury Anup', position: 'Executive Member', department: 'Accounting', order: 56 },
  { name: 'Shipra Biswas', position: 'Executive Member', department: 'International Relations', order: 57 },
  { name: 'Khairun Nessa', position: 'Executive Member', department: 'Political science', order: 58 },
  { name: 'Jesmin Ara Jessi', position: 'Executive Member', department: 'English', order: 59 },
  { name: 'KBM Saiful Alam', position: 'Executive Member', department: 'Microbiology', order: 60 },
  { name: 'Md. Abdul Latif', position: 'Executive Member', department: 'Chemistry', order: 61 },
  { name: 'Sharif Abdullah Al Mamun', position: 'Executive Member', department: 'Economics', order: 62 },
];

async function importExecutiveCommittee() {
  try {
    console.log('🚀 Starting Executive Committee import...\n');

    // Step 1: Create the Executive Committee
    console.log('📋 Creating Executive Committee...');
    const committeeRef = await db.collection('committees').add({
      name: 'Executive Committee',
      type: 'current',
      order: 0,
      createdAt: new Date(),
    });

    console.log('✅ Committee created with ID:', committeeRef.id);

    // Step 2: Add all members
    console.log('\n👥 Adding committee members...');
    let successCount = 0;
    let errorCount = 0;

    for (const member of executiveCommitteeMembers) {
      try {
        await db.collection('committees')
          .doc(committeeRef.id)
          .collection('members')
          .add({
            ...member,
            createdAt: new Date(),
          });
        
        successCount++;
        process.stdout.write(`\r✓ Added ${successCount}/${executiveCommitteeMembers.length} members`);
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Error adding ${member.name}:`, error);
      }
    }

    console.log('\n\n✅ Import completed!');
    console.log(`   - Committee: Executive Committee`);
    console.log(`   - Members added: ${successCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`\n🎉 All done! Visit /committee page to see the results.`);

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}

// Run the import
importExecutiveCommittee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
