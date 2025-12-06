/**
 * Script to import members from an Excel file
 * 
 * This script:
 * 1. Reads an Excel file with member data
 * 2. Creates Firebase Auth accounts for each member
 * 3. Creates member documents in Firestore
 * 4. Optionally sets admin roles
 * 
 * Excel file should have the following columns (headers in first row):
 * - email (required)
 * - full_name (required)
 * - password (optional - will generate if not provided)
 * - batch (optional - defaults to 1989)
 * - department (optional)
 * - current_location (optional)
 * - current_organization (optional)
 * - current_position (optional)
 * - phone (optional)
 * - is_admin (optional - "yes" or "true" to make admin)
 * - status (optional - defaults to "approved")
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
  email: string;
  full_name: string;
  password?: string;
  batch?: string;
  department?: string;
  current_location?: string;
  current_organization?: string;
  current_position?: string;
  phone?: string;
  is_admin?: string | boolean;
  status?: string;
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
 * Check if user should be admin
 */
function shouldBeAdmin(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'yes' || value.toLowerCase() === 'true' || value === '1';
  }
  return false;
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
  
  return jsonData.map(row => ({
    email: row.email?.trim(),
    full_name: row.full_name?.trim() || row.fullName?.trim() || row.name?.trim(),
    password: row.password?.trim(),
    batch: row.batch?.toString().trim() || '1989',
    department: row.department?.trim(),
    current_location: row.current_location?.trim() || row.currentLocation?.trim(),
    current_organization: row.current_organization?.trim() || row.currentOrganization?.trim(),
    current_position: row.current_position?.trim() || row.currentPosition?.trim(),
    phone: row.phone?.trim(),
    is_admin: row.is_admin || row.isAdmin || row.admin,
    status: row.status?.trim() || 'approved',
  }));
}

/**
 * Validate member data
 */
function validateMemberData(members: MemberData[]): { valid: MemberData[], invalid: any[] } {
  const valid: MemberData[] = [];
  const invalid: any[] = [];

  members.forEach((member, index) => {
    const errors: string[] = [];
    
    if (!member.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
      errors.push('Invalid email format');
    }
    
    if (!member.full_name) {
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
async function createMember(member: MemberData, index: number, total: number): Promise<{ success: boolean; email: string; password?: string; error?: string }> {
  const password = member.password || generatePassword();
  const isAdmin = shouldBeAdmin(member.is_admin);
  
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
        full_name: member.full_name,
        email: member.email,
        status: member.status || 'approved',
        batch: member.batch || '1989',
        department: member.department || '',
        current_location: member.current_location || '',
        current_organization: member.current_organization || '',
        current_position: member.current_position || '',
        phone: member.phone || '',
        updated_at: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`   ✅ Updated member document`);
      
      // Handle admin role
      if (isAdmin) {
        const roleSnapshot = await db.collection('user_roles')
          .where('user_id', '==', userRecord.uid)
          .where('role', '==', 'admin')
          .get();
        
        if (roleSnapshot.empty) {
          await db.collection('user_roles').add({
            user_id: userRecord.uid,
            role: 'admin',
            created_at: new Date().toISOString(),
          });
          console.log(`   ✅ Added admin role`);
        }
      }
      
      return { success: true, email: member.email };
      
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      
      // User doesn't exist, create new one
      userRecord = await auth.createUser({
        email: member.email,
        password: password,
        displayName: member.full_name,
        emailVerified: true,
      });
      
      console.log(`   ✅ Created auth user: ${userRecord.uid}`);
    }
    
    // Create member document
    await db.collection('members').doc(userRecord.uid).set({
      user_id: userRecord.uid,
      full_name: member.full_name,
      email: member.email,
      status: member.status || 'approved',
      batch: member.batch || '1989',
      department: member.department || '',
      current_location: member.current_location || '',
      current_organization: member.current_organization || '',
      current_position: member.current_position || '',
      phone: member.phone || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    
    console.log(`   ✅ Created member document`);
    
    // Create admin role if needed
    if (isAdmin) {
      await db.collection('user_roles').add({
        user_id: userRecord.uid,
        role: 'admin',
        created_at: new Date().toISOString(),
      });
      console.log(`   ✅ Added admin role`);
    }
    
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
      console.log('Usage: npm run import-members <path-to-excel-file>\n');
      console.log('Example: npm run import-members ./members.xlsx\n');
      process.exit(1);
    }
    
    const fullPath = path.resolve(excelFilePath);
    
    console.log('🚀 Starting member import process...\n');
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
