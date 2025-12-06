/**
 * Custom import script for Excel files with specific column format
 * 
 * Expected columns in Excel:
 * - Full Name
 * - Nick Name
 * - Department
 * - Hall
 * - Profession
 * - 09.08.1971 (or date column - will be treated as DOB)
 * - Mobile No
 * - Email
 * - Blood Group
 * - Present Address
 * - Home District
 */

import * as dotenv from 'dotenv';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

interface CustomMemberData {
  fullName: string;
  nickName?: string;
  department?: string;
  hall?: string;
  profession?: string;
  dateOfBirth?: string;
  mobileNo?: string;
  email: string;
  bloodGroup?: string;
  presentAddress?: string;
  homeDistrict?: string;
}

/**
 * Generate a random secure password
 */
function generatePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Normalize column names (remove spaces, special chars, lowercase)
 */
function normalizeColumnName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Map Excel row to member data with flexible column matching
 */
function mapExcelRowToMemberData(row: any): CustomMemberData | null {
  const keys = Object.keys(row);
  const normalizedMapping: { [key: string]: string } = {};
  
  // Create normalized key mapping
  keys.forEach(key => {
    normalizedMapping[normalizeColumnName(key)] = key;
  });
  
  // Helper function to get value by normalized key
  const getValue = (possibleNames: string[]): string | undefined => {
    for (const name of possibleNames) {
      const normalized = normalizeColumnName(name);
      if (normalizedMapping[normalized]) {
        const value = row[normalizedMapping[normalized]];
        return value ? String(value).trim() : undefined;
      }
    }
    return undefined;
  };
  
  const email = getValue(['Email', 'email', 'E-mail', 'Email Address']);
  const fullName = getValue(['Full Name', 'FullName', 'Name', 'full_name']);
  
  if (!email || !fullName) {
    return null;
  }
  
  return {
    email,
    fullName,
    nickName: getValue(['Nick Name', 'NickName', 'Nickname', 'nick_name']),
    department: getValue(['Department', 'Dept', 'dept']),
    hall: getValue(['Hall', 'hall']),
    profession: getValue(['Profession', 'profession', 'occupation', 'job']),
    dateOfBirth: getValue(['09.08.1971', 'DOB', 'Date of Birth', 'Birth Date', 'dob']),
    mobileNo: getValue(['Mobile No', 'Mobile', 'Phone', 'mobile_no', 'phone', 'Mobile Number']),
    bloodGroup: getValue(['Blood Group', 'BloodGroup', 'blood_group', 'Blood']),
    presentAddress: getValue(['Present Address', 'PresentAddress', 'Address', 'present_address', 'current_address']),
    homeDistrict: getValue(['Home District', 'HomeDistrict', 'home_district', 'District']),
  };
}

/**
 * Read Excel file and parse member data
 */
function readExcelFile(filePath: string): CustomMemberData[] {
  console.log(`📖 Reading Excel file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Found ${jsonData.length} rows in Excel file\n`);
  
  const members: CustomMemberData[] = [];
  jsonData.forEach((row, index) => {
    const member = mapExcelRowToMemberData(row);
    if (member) {
      members.push(member);
    } else {
      console.log(`⚠️  Row ${index + 2}: Missing required fields (email or full name)`);
    }
  });
  
  return members;
}

/**
 * Validate member data
 */
function validateMemberData(members: CustomMemberData[]): { valid: CustomMemberData[], invalid: any[] } {
  const valid: CustomMemberData[] = [];
  const invalid: any[] = [];

  members.forEach((member, index) => {
    const errors: string[] = [];
    
    if (!member.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push('Invalid email format');
    }
    
    if (!member.fullName) {
      errors.push('Full name is required');
    }

    if (errors.length > 0) {
      invalid.push({ row: index + 2, email: member.email, errors });
    } else {
      valid.push(member);
    }
  });

  return { valid, invalid };
}

/**
 * Create a single member
 */
async function createMember(member: CustomMemberData, index: number, total: number): Promise<{ success: boolean; email: string; password?: string; error?: string }> {
  const password = generatePassword();
  
  try {
    console.log(`[${index + 1}/${total}] Creating member: ${member.email}`);
    
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(member.email);
      console.log(`   ⚠️  User already exists with UID: ${userRecord.uid}`);
      
      // Update existing member document
      await db.collection('members').doc(userRecord.uid).set({
        user_id: userRecord.uid,
        full_name: member.fullName,
        nick_name: member.nickName || '',
        email: member.email,
        department: member.department || '',
        hall: member.hall || '',
        profession: member.profession || '',
        date_of_birth: member.dateOfBirth || '',
        phone: member.mobileNo || '',
        blood_group: member.bloodGroup || '',
        present_address: member.presentAddress || '',
        home_district: member.homeDistrict || '',
        status: 'approved',
        batch: '1989', // Default batch
        updated_at: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`   ✅ Updated member document`);
      
      return { success: true, email: member.email };
      
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      
      // User doesn't exist, create new one
      userRecord = await auth.createUser({
        email: member.email,
        password: password,
        displayName: member.fullName,
        emailVerified: true,
      });
      
      console.log(`   ✅ Created auth user: ${userRecord.uid}`);
    }
    
    // Create member document
    await db.collection('members').doc(userRecord.uid).set({
      user_id: userRecord.uid,
      full_name: member.fullName,
      nick_name: member.nickName || '',
      email: member.email,
      department: member.department || '',
      hall: member.hall || '',
      profession: member.profession || '',
      date_of_birth: member.dateOfBirth || '',
      phone: member.mobileNo || '',
      blood_group: member.bloodGroup || '',
      present_address: member.presentAddress || '',
      home_district: member.homeDistrict || '',
      status: 'approved',
      batch: '1989', // Default batch
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    console.log(`   ✅ Created member document`);
    
    return { success: true, email: member.email, password };
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, email: member.email, error: error.message };
  }
}

/**
 * Main import function
 */
async function importMembers() {
  try {
    // Get Excel file path from command line argument
    const excelFilePath = process.argv[2];
    
    if (!excelFilePath) {
      console.error('❌ Error: Please provide the path to the Excel file\n');
      console.log('Usage: npm run import-members-custom <path-to-excel-file>\n');
      console.log('Example: npm run import-members-custom ./members.xlsx\n');
      process.exit(1);
    }
    
    const fullPath = path.resolve(excelFilePath);
    
    console.log('🚀 Starting member import process...\n');
    console.log('📋 Expected columns: Full Name, Nick Name, Department, Hall, Profession, Mobile No, Email, Blood Group, Present Address, Home District\n');
    console.log('=' .repeat(60));
    
    // Read Excel file
    const members = readExcelFile(fullPath);
    
    // Validate data
    const { valid, invalid } = validateMemberData(members);
    
    if (invalid.length > 0) {
      console.log('⚠️  Invalid rows found:\n');
      invalid.forEach(item => {
        console.log(`   Row ${item.row}: ${item.email || 'No email'}`);
        item.errors.forEach((err: string) => console.log(`      - ${err}`));
      });
      console.log();
    }
    
    if (valid.length === 0) {
      console.log('❌ No valid members to import\n');
      return;
    }
    
    console.log(`✅ ${valid.length} valid members to import\n`);
    console.log('=' .repeat(60));
    console.log('\nStarting import...\n');
    
    // Import members one by one
    const results = [];
    for (let i = 0; i < valid.length; i++) {
      const result = await createMember(valid[i], i, valid.length);
      results.push(result);
      console.log(); // Empty line between members
    }
    
    // Generate summary
    console.log('=' .repeat(60));
    console.log('\n📊 IMPORT SUMMARY\n');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully imported: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed imports:');
      failed.forEach(f => {
        console.log(`   - ${f.email}: ${f.error}`);
      });
    }
    
    // Save credentials to file
    const newMembers = results.filter(r => r.success && r.password);
    if (newMembers.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const credentialsFile = path.join(process.cwd(), `member-credentials-${timestamp}.txt`);
      
      let credentialsContent = '='.repeat(60) + '\n';
      credentialsContent += 'MEMBER LOGIN CREDENTIALS\n';
      credentialsContent += `Generated: ${new Date().toLocaleString()}\n`;
      credentialsContent += '='.repeat(60) + '\n\n';
      
      newMembers.forEach(m => {
        credentialsContent += `Email: ${m.email}\n`;
        credentialsContent += `Password: ${m.password}\n`;
        credentialsContent += '-'.repeat(40) + '\n';
      });
      
      fs.writeFileSync(credentialsFile, credentialsContent);
      console.log(`\n📄 Credentials saved to: ${credentialsFile}\n`);
    }
    
    console.log('\n✅ Import process completed!\n');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
importMembers()
  .then(() => {
    console.log('✨ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
