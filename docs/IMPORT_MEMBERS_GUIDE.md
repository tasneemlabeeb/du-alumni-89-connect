# Import Members from Excel - Guide

## Quick Start

### 1. Prepare Your Excel File

Create an Excel file (`.xlsx` or `.xls`) with the following columns in the first row (headers):

#### Required Columns:
- **email** - Member's email address (must be valid and unique)
- **full_name** - Member's full name

#### Optional Columns:
- **password** - Login password (if not provided, a random secure password will be generated)
- **batch** - Graduation batch year (defaults to "1989")
- **department** - Department/Faculty name
- **current_location** - Current city/country
- **current_organization** - Current company/organization
- **current_position** - Current job title
- **phone** - Contact phone number
- **is_admin** - Set to "yes", "true", or "1" to make this user an admin
- **status** - Member status (defaults to "approved", can be "pending")

#### Example Excel Structure:

| email | full_name | password | batch | department | current_location | current_organization | current_position | phone | is_admin | status |
|-------|-----------|----------|-------|------------|------------------|---------------------|------------------|-------|----------|--------|
| john@example.com | John Doe | MyPass123! | 1989 | Computer Science | Dhaka, Bangladesh | Tech Corp | Senior Developer | +8801711111111 | yes | approved |
| jane@example.com | Jane Smith | | 1989 | Economics | New York, USA | Finance Inc | Manager | +1234567890 | no | approved |
| bob@example.com | Bob Wilson | SecurePass456 | 1989 | Physics | | | | | | approved |

### 2. Run the Import Script

```bash
npm run import-members path/to/your/excel-file.xlsx
```

Or if the Excel file is in your project root:

```bash
npm run import-members ./members.xlsx
```

### 3. Check the Results

After the script runs:

1. **Console Output**: Shows detailed progress for each member
2. **Credentials File**: A text file named `member-credentials-YYYY-MM-DD-HH-MM-SS.txt` will be created in your project root containing login credentials for all newly created members
3. **Summary Report**: Shows how many members were successfully imported and any failures

## What the Script Does

For each row in the Excel file:

1. ✅ **Validates** the email and required fields
2. 🔍 **Checks** if the user already exists in Firebase
3. 👤 **Creates** Firebase Auth account (or updates existing)
4. 📝 **Creates/Updates** member document in Firestore `members` collection
5. 🔐 **Assigns** admin role if `is_admin` is set to "yes"
6. 🔑 **Generates** secure random password if not provided
7. 💾 **Saves** all credentials to a text file

## Features

- **Auto-generates passwords**: If you don't provide passwords, the script creates secure random passwords
- **Handles existing users**: If a user with the email already exists, it updates their information instead of failing
- **Validation**: Validates email format and required fields before attempting import
- **Detailed logging**: Shows progress for each member being imported
- **Error handling**: Continues importing other members even if one fails
- **Credentials export**: Automatically saves all login credentials to a file
- **Admin assignment**: Can automatically assign admin roles during import
- **Batch processing**: Handles any number of members in one go

## Sample Excel Templates

### Minimal Template (Only Required Fields)

| email | full_name |
|-------|-----------|
| member1@example.com | Member One |
| member2@example.com | Member Two |

### Complete Template (All Fields)

| email | full_name | password | batch | department | current_location | current_organization | current_position | phone | is_admin | status |
|-------|-----------|----------|-------|------------|------------------|---------------------|------------------|-------|----------|--------|
| admin@duaab89.com | Admin User | Admin@123 | 1989 | Computer Science | Dhaka | DU Alumni Org | Administrator | +8801711111111 | yes | approved |
| member@duaab89.com | Regular Member | | 1989 | Economics | London | Tech Ltd | Developer | +441234567890 | no | approved |

## Common Issues & Solutions

### Issue: "File not found"
**Solution**: Make sure you provide the correct path to your Excel file. Use absolute path or relative path from project root.

```bash
# Absolute path
npm run import-members /Users/yourname/Desktop/members.xlsx

# Relative path from project root
npm run import-members ./data/members.xlsx
```

### Issue: "Email already exists"
**Solution**: This is not an error! The script will update the existing user's information. Check the console output - it will say "User already exists" and then update their member document.

### Issue: Invalid email format
**Solution**: Make sure all email addresses in your Excel file follow the format: `username@domain.com`

### Issue: Missing required fields
**Solution**: Ensure each row has both `email` and `full_name` columns filled in.

## Best Practices

1. **Test with a small file first**: Create a test Excel file with 2-3 members to verify everything works
2. **Backup your data**: Before running mass imports, ensure you have a backup
3. **Review the Excel file**: Double-check for typos, duplicate emails, and invalid data
4. **Save credentials securely**: The generated credentials file contains sensitive information - store it securely and delete after distributing to members
5. **Use strong passwords**: If providing passwords in Excel, make them strong (mix of letters, numbers, symbols)
6. **Notify members**: Send the login credentials to members via secure channels (not through the Excel file itself)

## Credentials File

After import, you'll get a file like this:

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

**Important**: 
- Store this file securely
- Send credentials to members through secure channels (encrypted email, secure portal)
- Delete the file after credentials are distributed
- Encourage members to change their passwords after first login

## Troubleshooting

### Script won't run
1. Make sure you've installed dependencies: `npm install`
2. Check that your `.env.local` file has Firebase Admin credentials
3. Verify Firebase Admin SDK is properly configured

### Some members fail to import
1. Check the error message for each failed member in the console
2. Common causes:
   - Invalid email format
   - Duplicate email (within the Excel file)
   - Missing required fields
   - Firebase quota limits (if importing many users)

### Need to re-import
The script is safe to run multiple times - it will update existing users rather than create duplicates.

## Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify your Excel file format matches the template
3. Ensure Firebase credentials are properly configured
4. Review the generated credentials file for successfully imported members

## Example Usage

```bash
# Import from current directory
npm run import-members ./new-members.xlsx

# Import from Desktop
npm run import-members ~/Desktop/members.xlsx

# Import from specific path
npm run import-members /path/to/members.xlsx
```

The script will show progress like this:

```
🚀 Starting member import process...
============================================================
📖 Reading Excel file: ./members.xlsx

✅ Found 10 rows in Excel file

✅ 10 valid members to import

============================================================

Starting import...

[1/10] Creating member: john@example.com
   ✅ Created auth user: abc123def456
   ✅ Created member document
   ✅ Added admin role

[2/10] Creating member: jane@example.com
   ⚠️  User already exists with UID: xyz789
   ✅ Updated member document

...

============================================================

📊 IMPORT SUMMARY

✅ Successfully imported: 10
❌ Failed: 0

📄 Credentials saved to: member-credentials-2025-12-06T15-30-00-000Z.txt

✅ Import process completed!
```
