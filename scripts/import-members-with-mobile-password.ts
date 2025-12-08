/**
 * Import members from Excel with password based on mobile number
 * 
 * Expected columns in Excel:
 * - Full Name (Required)
 * - Nick Name
 * - Department
 * - Hall
 * - Profession
 * - Date of Birth
 * - Mobile No (Required for password generation)
 * - Email (Required - used as login username)
 * - Blood Group
 * - Present Address
 * - Home District
 * 
 * Password Generation:
 * - Takes last 4 digits of Mobile No + "1234"
 * - If multiple numbers in Mobile No field (comma/slash/space separated), uses first number only
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

interface MemberData {
  fullName: string;
  nickName?: string;
  department?: string;
  hall?: string;
  profession?: string;
  dateOfBirth?: string;
  mobileNo: string;
  email: string;
  bloodGroup?: string;
  presentAddress?: string;
  homeDistrict?: string;
}

/**
 * Extract first mobile number from a string that may contain multiple numbers
 * separated by comma, slash, or space
 */
function extractFirstMobileNumber(mobileNoField: string): string {
  if (!mobileNoField) return '';
  
  // Remove all spaces first for easier processing
  const cleaned = String(mobileNoField).trim();
  
  // Split by comma, slash, or multiple spaces
  const numbers = cleaned.split(/[,/\s]+/);
  
  // Return first non-empty entry
  const firstNumber = numbers.find(num => num.trim().length > 0);
  return firstNumber ? firstNumber.trim() : '';
}

/**
 * Generate password from mobile number: last 4 digits + "1234"
 */
function generatePasswordFromMobile(mobileNoField: string): string {
  const firstNumber = extractFirstMobileNumber(mobileNoField);
  
  if (!firstNumber) {
    throw new Error('No valid mobile number found');
  }
  
  // Extract only digits from the mobile number
  const digits = firstNumber.replace(/\D/g, '');
  
  if (digits.length < 4) {
    throw new Error(`Mobile number too short: ${firstNumber} (needs at least 4 digits)`);
  }
  
  // Get last 4 digits
  const last4Digits = digits.slice(-4);
  
  // Combine with "1234"
  const password = last4Digits + '1234';
  
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
function mapExcelRowToMemberData(row: any): MemberData | null {
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
  const mobileNo = getValue(['Mobile No', 'Mobile', 'Phone', 'mobile_no', 'phone', 'Mobile Number']);
  
  if (!email || !fullName || !mobileNo) {
    return null;
  }
  
  return {
    email,
    fullName,
    mobileNo,
    nickName: getValue(['Nick Name', 'NickName', 'Nickname', 'nick_name']),
    department: getValue(['Department', 'Dept', 'dept']),
    hall: getValue(['Hall', 'hall']),
    profession: getValue(['Profession', 'profession', 'occupation', 'job']),
    dateOfBirth: getValue(['Date of Birth', 'DOB', 'Birth Date', 'dob', '09.08.1971']),
    bloodGroup: getValue(['Blood Group', 'BloodGroup', 'blood_group', 'Blood']),
    presentAddress: getValue(['Present Address', 'PresentAddress', 'Address', 'present_address', 'current_address']),
    homeDistrict: getValue(['Home District', 'HomeDistrict', 'home_district', 'District']),
  };
}

/**
 * Read Excel file and parse member data
 */
function readExcelFile(filePath: string): MemberData[] {
  console.log(`📖 Reading Excel file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✅ Found ${jsonData.length} rows in Excel file\n`);
  
  const members: MemberData[] = [];
  jsonData.forEach((row, index) => {
    const member = mapExcelRowToMemberData(row);
    if (member) {
      members.push(member);
    } else {
      console.log(`⚠️  Row ${index + 2}: Missing required fields (email, full name, or mobile no)`);
    }
  });
  
  return members;
}

/**
 * Validate member data and generate passwords
 */
function validateMemberData(members: MemberData[]): { 
  valid: Array<MemberData & { password: string }>, 
  invalid: any[] 
} {
  const valid: Array<MemberData & { password: string }> = [];
  const invalid: any[] = [];

  members.forEach((member, index) => {
    const errors: string[] = [];
    let password = '';
    
    if (!member.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push('Invalid email format');
    }
    
    if (!member.fullName) {
      errors.push('Full name is required');
    }
    
    if (!member.mobileNo) {
      errors.push('Mobile number is required');
    } else {
      try {
        password = generatePasswordFromMobile(member.mobileNo);
      } catch (error: any) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      invalid.push({ row: index + 2, email: member.email, mobileNo: member.mobileNo, errors });
    } else {
      valid.push({ ...member, password });
    }
  });

  return { valid, invalid };
}

/**
 * Create a single member
 */
async function createMember(
  member: MemberData & { password: string }, 
  index: number, 
  total: number
): Promise<{ success: boolean; email: string; password: string; isNew: boolean; error?: string }> {
  try {
    console.log(`[${index + 1}/${total}] Creating member: ${member.email}`);
    console.log(`   📱 Mobile: ${member.mobileNo}`);
    console.log(`   🔑 Password: ${member.password} (last 4 digits: ${member.password.slice(0, 4)})`);
    
    // Check if user already exists
    let userRecord;
    let isNew = false;
    
    try {
      userRecord = await auth.getUserByEmail(member.email);
      console.log(`   ⚠️  User already exists with UID: ${userRecord.uid}`);
      
      // Update password for existing user
      await auth.updateUser(userRecord.uid, {
        password: member.password,
        displayName: member.fullName,
      });
      
      console.log(`   ✅ Updated auth user password`);
      
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      
      // User doesn't exist, create new one
      userRecord = await auth.createUser({
        email: member.email,
        password: member.password,
        displayName: member.fullName,
        emailVerified: true,
      });
      
      isNew = true;
      console.log(`   ✅ Created auth user: ${userRecord.uid}`);
    }
    
    // Create or update member document
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
      ...(isNew ? { created_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    }, { merge: true });
    
    console.log(`   ✅ ${isNew ? 'Created' : 'Updated'} member document`);
    
    return { success: true, email: member.email, password: member.password, isNew };
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, email: member.email, password: member.password, isNew: false, error: error.message };
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
      console.log('Usage: npm run import-members-mobile <path-to-excel-file>\n');
      console.log('Example: npm run import-members-mobile ./members.xlsx\n');
      console.log('Example: npm run import-members-mobile ~/Desktop/alumni.xlsx\n');
      process.exit(1);
    }
    
    const fullPath = path.resolve(excelFilePath);
    
    console.log('🚀 Starting member import process...\n');
    console.log('📋 Required columns: Full Name, Email, Mobile No\n');
    console.log('🔑 Password format: Last 4 digits of Mobile No + "1234"\n');
    console.log('=' .repeat(60));
    
    // Read Excel file
    const members = readExcelFile(fullPath);
    
    // Validate data and generate passwords
    const { valid, invalid } = validateMemberData(members);
    
    if (invalid.length > 0) {
      console.log('\n⚠️  Invalid rows found:\n');
      invalid.forEach(item => {
        console.log(`   Row ${item.row}: ${item.email || 'No email'} (Mobile: ${item.mobileNo || 'None'})`);
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
    const newMembers = results.filter(r => r.success && r.isNew);
    const updatedMembers = results.filter(r => r.success && !r.isNew);
    
    console.log(`✅ Successfully processed: ${successful.length}`);
    console.log(`   - New members: ${newMembers.length}`);
    console.log(`   - Updated members: ${updatedMembers.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed imports:');
      failed.forEach(f => {
        console.log(`   - ${f.email}: ${f.error}`);
      });
    }
    
    // Save all credentials to file (both new and updated)
    if (successful.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];
      const credentialsFile = path.join(process.cwd(), `member-credentials-${timestamp}.txt`);
      
      let credentialsContent = '='.repeat(60) + '\n';
      credentialsContent += 'MEMBER LOGIN CREDENTIALS\n';
      credentialsContent += `Generated: ${new Date().toLocaleString()}\n`;
      credentialsContent += `Total Members: ${successful.length}\n`;
      credentialsContent += '='.repeat(60) + '\n\n';
      
      credentialsContent += '📝 PASSWORD FORMAT: Last 4 digits of mobile number + 1234\n\n';
      
      successful.forEach(m => {
        credentialsContent += `Email: ${m.email}\n`;
        credentialsContent += `Password: ${m.password}\n`;
        credentialsContent += `Status: ${m.isNew ? 'NEW' : 'UPDATED'}\n`;
        credentialsContent += '-'.repeat(40) + '\n';
      });
      
      fs.writeFileSync(credentialsFile, credentialsContent);
      console.log(`\n📄 All credentials saved to: ${credentialsFile}\n`);
      console.log('⚠️  IMPORTANT: Send these credentials to members securely and delete this file!\n');
    }
    
    console.log('\n✅ Import process completed!\n');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
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
