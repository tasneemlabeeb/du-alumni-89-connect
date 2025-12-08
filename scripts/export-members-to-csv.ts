import * as dotenv from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin if not already initialized
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

// Function to escape CSV fields
function escapeCSV(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  const stringField = String(field);
  // If the field contains comma, newline, or double quote, wrap it in quotes and escape quotes
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

async function exportMembersToCSV() {
  try {
    console.log('📧 Fetching all members from Firestore...\n');
    
    // Fetch all members from Firestore
    const membersSnapshot = await db.collection('members').get();
    
    if (membersSnapshot.empty) {
      console.log('❌ No members found in the database.\n');
      return;
    }

    console.log(`✅ Found ${membersSnapshot.size} members\n`);
    
    // Prepare CSV data
    const csvRows: string[] = [];
    
    // CSV Header
    const headers = [
      'No',
      'Email',
      'Full Name',
      'Nick Name',
      'Status',
      'Batch',
      'Department',
      'Hall',
      'Current Location',
      'Current Organization',
      'Current Position',
      'Phone',
      'Blood Group',
      'Created At',
      'Updated At'
    ];
    
    csvRows.push(headers.map(escapeCSV).join(','));
    
    // Collect member data
    const membersData: any[] = [];
    membersSnapshot.forEach((doc) => {
      const data = doc.data();
      membersData.push({
        id: doc.id,
        ...data
      });
    });
    
    // Sort by email
    membersData.sort((a, b) => {
      const emailA = (a.email || '').toLowerCase();
      const emailB = (b.email || '').toLowerCase();
      return emailA.localeCompare(emailB);
    });
    
    // Add data rows
    membersData.forEach((member, index) => {
      const row = [
        index + 1,
        member.email || '',
        member.full_name || member.name || '',
        member.nick_name || '',
        member.status || '',
        member.batch || member.graduation_year || '',
        member.department || '',
        member.hall || '',
        member.current_location || '',
        member.current_organization || '',
        member.current_position || '',
        member.phone || member.contactNo || member.mobile || '',
        member.blood_group || '',
        member.created_at || '',
        member.updated_at || ''
      ];
      
      csvRows.push(row.map(escapeCSV).join(','));
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `members-export-${timestamp}.csv`;
    const filepath = path.join(process.cwd(), filename);
    
    // Write to file
    fs.writeFileSync(filepath, csvContent, 'utf-8');
    
    console.log('✅ CSV file created successfully!\n');
    console.log('📁 File location:', filepath);
    console.log('📊 Total records:', membersData.length);
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 SUMMARY BY STATUS:\n');
    
    // Count by status
    const statusCounts: Record<string, number> = {};
    membersData.forEach(member => {
      const status = member.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✨ You can now open the CSV file in Excel, Google Sheets, or any spreadsheet application.\n');
    
  } catch (error) {
    console.error('❌ Error exporting members to CSV:', error);
  } finally {
    process.exit(0);
  }
}

exportMembersToCSV();
