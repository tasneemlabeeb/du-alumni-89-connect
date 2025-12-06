# Member Import System - Complete Setup

## ✅ What Has Been Created

### 1. Main Import Script
**File**: `scripts/import-members-from-excel.ts`

Features:
- Reads Excel files (.xlsx, .xls)
- Validates member data
- Creates Firebase Auth accounts
- Creates/updates Firestore member documents
- Auto-generates secure passwords
- Assigns admin roles
- Exports credentials to text file
- Detailed progress logging
- Error handling with summary report

### 2. Template Generator Script
**File**: `scripts/create-member-template.ts`

Creates two Excel templates:
- **Full template**: All available fields with examples
- **Minimal template**: Only required fields (email, full_name)

### 3. Documentation
**Files**:
- `docs/IMPORT_MEMBERS_GUIDE.md` - Complete user guide
- `scripts/README-IMPORT.md` - Quick reference

### 4. NPM Scripts
Added to `package.json`:
```json
"create-template": "tsx scripts/create-member-template.ts"
"import-members": "tsx scripts/import-members-from-excel.ts"
```

### 5. Dependencies
Installed:
- `xlsx` - Excel file reading/writing

---

## 🚀 How to Use - Step by Step

### Step 1: Create Excel Template
```bash
npm run create-template
```

This creates two files in your project root:
- `member-import-template-full.xlsx`
- `member-import-template-minimal.xlsx`

### Step 2: Prepare Your Excel File

**Option A**: Use the generated template
1. Open `member-import-template-full.xlsx` or `member-import-template-minimal.xlsx`
2. Delete the sample rows
3. Add your member data
4. Save the file

**Option B**: Use your existing Excel file
Make sure it has these columns (case-sensitive):

**Required**:
- `email` - Member's email address
- `full_name` - Member's full name

**Optional**:
- `password` - Login password (leave blank to auto-generate)
- `batch` - Batch year (defaults to 1989)
- `department` - Department name
- `current_location` - Current city/country
- `current_organization` - Current company
- `current_position` - Job title
- `phone` - Phone number
- `is_admin` - Set to "yes", "true", or "1" for admin access
- `status` - "approved" or "pending" (defaults to "approved")

### Step 3: Run Import
```bash
npm run import-members path/to/your/file.xlsx
```

Examples:
```bash
# If file is in project root
npm run import-members ./members.xlsx

# If file is in data folder
npm run import-members ./data/members.xlsx

# If file is on Desktop
npm run import-members ~/Desktop/members.xlsx

# Absolute path
npm run import-members /Users/yourname/Documents/members.xlsx
```

### Step 4: Review Results

The script will:
1. Show progress for each member in the console
2. Display a summary at the end
3. Create a credentials file: `member-credentials-[timestamp].txt`

**Sample Output**:
```
🚀 Starting member import process...
============================================================
📖 Reading Excel file: ./members.xlsx

✅ Found 5 rows in Excel file

✅ 5 valid members to import

============================================================

Starting import...

[1/5] Creating member: john@example.com
   ✅ Created auth user: abc123def456
   ✅ Created member document
   ✅ Added admin role

[2/5] Creating member: jane@example.com
   ✅ Created auth user: xyz789ghi012
   ✅ Created member document

...

============================================================

📊 IMPORT SUMMARY

✅ Successfully imported: 5
❌ Failed: 0

📄 Credentials saved to: member-credentials-2025-12-06T15-30-00.txt

✅ Import process completed!
```

### Step 5: Distribute Credentials

1. Open the generated credentials file
2. Send login details to each member securely (encrypted email, secure portal)
3. **Delete the credentials file** after distribution
4. Advise members to change their password after first login

---

## 📋 Excel File Examples

### Example 1: Minimal (Required Fields Only)
```
| email                | full_name       |
|----------------------|-----------------|
| john@example.com     | John Doe        |
| jane@example.com     | Jane Smith      |
| bob@example.com      | Bob Wilson      |
```

### Example 2: With Auto-Generated Passwords
```
| email                | full_name       | password |
|----------------------|-----------------|----------|
| john@example.com     | John Doe        |          |
| jane@example.com     | Jane Smith      |          |
```
Script will generate secure passwords for all members.

### Example 3: With Custom Passwords
```
| email                | full_name       | password      |
|----------------------|-----------------|---------------|
| john@example.com     | John Doe        | MyPass123!    |
| jane@example.com     | Jane Smith      | SecureP@ss456 |
```

### Example 4: Creating Admins
```
| email                | full_name       | is_admin |
|----------------------|-----------------|----------|
| admin@duaab89.com    | Admin User      | yes      |
| john@example.com     | Regular User    | no       |
```

### Example 5: Complete Profile
```
| email           | full_name  | batch | department  | current_location | current_organization | current_position | phone          | is_admin |
|-----------------|------------|-------|-------------|------------------|---------------------|------------------|----------------|----------|
| john@ex.com     | John Doe   | 1989  | CS          | Dhaka            | Tech Corp           | Developer        | +8801711111111 | yes      |
| jane@ex.com     | Jane Smith | 1989  | Economics   | New York         | Finance Inc         | Manager          | +1234567890    | no       |
```

---

## 🔧 Advanced Features

### Feature 1: Update Existing Users
If you run the import with emails that already exist in the system:
- The script will **update** their information (not create duplicates)
- Existing Firebase Auth passwords are **not changed**
- Member document fields are updated with new values

### Feature 2: Batch Processing
Import any number of members:
- No practical limit on file size
- Script processes one member at a time
- Continues even if some members fail

### Feature 3: Password Generation
Auto-generated passwords:
- 12 characters long
- Include uppercase, lowercase, numbers, and symbols
- Cryptographically secure random generation

### Feature 4: Admin Assignment
Automatically assign admin roles during import:
- Set `is_admin` column to "yes", "true", or "1"
- Script creates `user_roles` document with admin role
- Works for both new and existing users

### Feature 5: Validation
Pre-import validation checks:
- Email format validation
- Required field verification
- Shows all validation errors before import starts

---

## ⚠️ Important Considerations

### Security
1. **Never commit** Excel files with real member data to git
2. **Never commit** credentials files to git
3. **Delete credentials files** after distribution
4. Store Excel files with passwords **encrypted** or in secure location
5. Use **secure channels** to send credentials (encrypted email, secure portal)

### Data Privacy
- Member data includes personal information
- Comply with data protection regulations (GDPR, etc.)
- Get consent before importing member data
- Have a data retention and deletion policy

### Firestore Costs
- Each import creates/updates Firestore documents
- Batch imports may incur costs depending on volume
- Monitor Firebase usage and billing

### Rate Limits
- Firebase has rate limits for Auth operations
- For very large imports (1000+ members), consider:
  - Splitting into smaller batches
  - Adding delays between operations
  - Running during off-peak hours

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'xlsx'"
**Solution**:
```bash
npm install
```

### Problem: "File not found"
**Solution**: Check file path
```bash
# Use absolute path
npm run import-members /full/path/to/file.xlsx

# Or relative from project root
npm run import-members ./file.xlsx
```

### Problem: "Invalid email format"
**Solution**: Check Excel file for:
- Emails without @ symbol
- Emails with spaces
- Invalid domain names

### Problem: "Missing required fields"
**Solution**: Ensure every row has:
- `email` column filled
- `full_name` column filled

### Problem: Some members fail to import
**Solution**: 
1. Check the error message for each failed member
2. Fix the issues in Excel file
3. Re-run import (it will update existing ones)

### Problem: Firebase Admin credentials not found
**Solution**: Check `.env.local` has:
```
FIREBASE_ADMIN_PROJECT_ID=...
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

---

## 📊 File Outputs

### Credentials File
**Location**: Project root  
**Name**: `member-credentials-[timestamp].txt`  
**Contents**: Email and password for each new member

**Example**:
```
============================================================
MEMBER LOGIN CREDENTIALS
Generated: 12/6/2025, 3:30:00 PM
============================================================

Email: john@example.com
Password: aB3$xY9@mN2p
----------------------------------------
Email: jane@example.com
Password: kL7!wQ5#rT8z
----------------------------------------
```

### Excel Templates
**Location**: Project root  
**Files**: 
- `member-import-template-full.xlsx` - All fields with examples
- `member-import-template-minimal.xlsx` - Only required fields

---

## 📚 Additional Resources

- **Complete Guide**: `docs/IMPORT_MEMBERS_GUIDE.md`
- **Quick Reference**: `scripts/README-IMPORT.md`
- **Firebase Setup**: `docs/FIREBASE_SETUP.md`
- **Admin Guide**: `docs/ADMIN_MEMBER_APPROVAL.md`

---

## 🎯 Common Workflows

### Workflow 1: Import New Alumni Batch
```bash
# 1. Create template
npm run create-template

# 2. Fill in member data in Excel
# 3. Import
npm run import-members ./new-batch-2024.xlsx

# 4. Send credentials to members
# 5. Delete credentials file
rm member-credentials-*.txt
```

### Workflow 2: Update Existing Members
```bash
# 1. Create Excel with updated info (same emails)
# 2. Import (will update existing records)
npm run import-members ./updated-members.xlsx
```

### Workflow 3: Add Admin Users
```bash
# 1. Create Excel with is_admin = yes
# 2. Import
npm run import-members ./new-admins.xlsx
```

### Workflow 4: Mass Import with Auto Passwords
```bash
# 1. Create Excel with only email and full_name
# 2. Leave password column empty
# 3. Import
npm run import-members ./members-no-passwords.xlsx

# 4. Script generates secure passwords
# 5. Check credentials file for generated passwords
cat member-credentials-*.txt
```

---

## ✨ Tips for Success

1. **Test First**: Import 2-3 test members before bulk import
2. **Backup**: Have a backup of your Firestore data
3. **Review Excel**: Double-check for typos and duplicates
4. **Small Batches**: For large imports, split into smaller files
5. **Monitor**: Watch console output during import
6. **Verify**: Check Firebase Console after import
7. **Secure Credentials**: Store and send credentials securely
8. **Member Communication**: Inform members about their accounts

---

## 🎓 Quick Start Summary

```bash
# 1. Create template
npm run create-template

# 2. Edit the template file with your data

# 3. Import members
npm run import-members ./member-import-template-full.xlsx

# 4. Check credentials file
cat member-credentials-*.txt

# 5. Send credentials to members securely

# 6. Delete credentials file
rm member-credentials-*.txt
```

That's it! Your members are now imported and can log in to the system.
