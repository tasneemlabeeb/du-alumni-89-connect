/**
 * Script to create a sample Excel template for member import
 * Run: npm run create-template
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

function createTemplate() {
  console.log('📝 Creating member import template...\n');

  // Sample data with examples
  const templateData = [
    {
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      password: 'MySecurePass123!',
      batch: '1989',
      department: 'Computer Science',
      current_location: 'Dhaka, Bangladesh',
      current_organization: 'Tech Corporation',
      current_position: 'Senior Software Engineer',
      phone: '+8801711111111',
      is_admin: 'yes',
      status: 'approved'
    },
    {
      email: 'jane.smith@example.com',
      full_name: 'Jane Smith',
      password: '',
      batch: '1989',
      department: 'Economics',
      current_location: 'New York, USA',
      current_organization: 'Finance Inc',
      current_position: 'Financial Manager',
      phone: '+1234567890',
      is_admin: 'no',
      status: 'approved'
    },
    {
      email: 'bob.wilson@example.com',
      full_name: 'Bob Wilson',
      password: '',
      batch: '1989',
      department: 'Physics',
      current_location: '',
      current_organization: '',
      current_position: '',
      phone: '',
      is_admin: '',
      status: 'approved'
    }
  ];

  // Create minimal template (only required fields)
  const minimalData = [
    { email: 'member1@example.com', full_name: 'Member One' },
    { email: 'member2@example.com', full_name: 'Member Two' },
    { email: 'member3@example.com', full_name: 'Member Three' }
  ];

  // Create worksheets
  const fullWorksheet = XLSX.utils.json_to_sheet(templateData);
  const minimalWorksheet = XLSX.utils.json_to_sheet(minimalData);

  // Create workbooks
  const fullWorkbook = XLSX.utils.book_new();
  const minimalWorkbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(fullWorkbook, fullWorksheet, 'Members');
  XLSX.utils.book_append_sheet(minimalWorkbook, minimalWorksheet, 'Members');

  // Set column widths for better visibility
  const wscols = [
    { wch: 25 }, // email
    { wch: 20 }, // full_name
    { wch: 15 }, // password
    { wch: 8 },  // batch
    { wch: 20 }, // department
    { wch: 20 }, // current_location
    { wch: 25 }, // current_organization
    { wch: 25 }, // current_position
    { wch: 15 }, // phone
    { wch: 10 }, // is_admin
    { wch: 10 }  // status
  ];

  fullWorksheet['!cols'] = wscols;
  minimalWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

  // Save files
  const fullTemplatePath = path.join(process.cwd(), 'member-import-template-full.xlsx');
  const minimalTemplatePath = path.join(process.cwd(), 'member-import-template-minimal.xlsx');

  XLSX.writeFile(fullWorkbook, fullTemplatePath);
  XLSX.writeFile(minimalWorkbook, minimalTemplatePath);

  console.log('✅ Templates created successfully!\n');
  console.log('📄 Full template (all fields):');
  console.log(`   ${fullTemplatePath}\n`);
  console.log('📄 Minimal template (required fields only):');
  console.log(`   ${minimalTemplatePath}\n`);
  console.log('💡 Tips:');
  console.log('   - Edit the template files with your member data');
  console.log('   - Delete the sample rows and add your real members');
  console.log('   - Required fields: email, full_name');
  console.log('   - Leave password blank to auto-generate secure passwords');
  console.log('   - Set is_admin to "yes" to make a member an admin\n');
  console.log('📖 For more information, see docs/IMPORT_MEMBERS_GUIDE.md\n');
}

createTemplate();
