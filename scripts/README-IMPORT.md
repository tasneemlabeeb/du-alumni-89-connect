# Member Import Scripts - Quick Reference

## 📋 Quick Steps

### Step 1: Create Template
```bash
npm run create-template
```
This generates two Excel templates in your project root:
- `member-import-template-full.xlsx` - Template with all fields
- `member-import-template-minimal.xlsx` - Template with only required fields

### Step 2: Fill in Your Data
1. Open one of the generated template files
2. Delete the sample rows
3. Add your real member data
4. Save the file

### Step 3: Import Members
```bash
npm run import-members path/to/your-file.xlsx
```

Example:
```bash
npm run import-members ./member-import-template-full.xlsx
```

### Step 4: Get Credentials
After import, check the generated file:
- `member-credentials-[timestamp].txt` - Contains all login credentials

## 📊 Excel File Format

### Required Columns
- `email` - Member's email (must be valid and unique)
- `full_name` - Member's full name

### Optional Columns
- `password` - Login password (auto-generated if blank)
- `batch` - Batch year (default: 1989)
- `department` - Department/Faculty
- `current_location` - Current city/country
- `current_organization` - Current company
- `current_position` - Current job title
- `phone` - Contact number
- `is_admin` - "yes" or "true" to make admin
- `status` - "approved" or "pending" (default: approved)

## 🎯 Common Use Cases

### Import Regular Members
Just fill in email and full_name, leave other fields empty:
```
email                  | full_name
john@example.com       | John Doe
jane@example.com       | Jane Smith
```

### Import with Auto-Generated Passwords
Leave password column empty, script will generate secure passwords:
```
email                  | full_name      | password
john@example.com       | John Doe       | 
jane@example.com       | Jane Smith     |
```

### Import Admin Users
Set is_admin to "yes":
```
email                  | full_name      | is_admin
admin@example.com      | Admin User     | yes
```

### Import with Custom Passwords
Provide your own passwords:
```
email                  | full_name      | password
john@example.com       | John Doe       | MyPass123!
```

## ✅ What Happens During Import

For each member:
1. ✓ Validates email and required fields
2. ✓ Creates Firebase Auth account (or updates if exists)
3. ✓ Creates/updates member document in Firestore
4. ✓ Assigns admin role if specified
5. ✓ Generates password if not provided
6. ✓ Saves credentials to file

## 🔍 Checking Results

### Console Output
The script shows detailed progress:
```
[1/10] Creating member: john@example.com
   ✅ Created auth user: abc123
   ✅ Created member document
   ✅ Added admin role
```

### Summary Report
After completion:
```
📊 IMPORT SUMMARY
✅ Successfully imported: 10
❌ Failed: 0
📄 Credentials saved to: member-credentials-2025-12-06.txt
```

### Credentials File
Contains all login information:
```
Email: john@example.com
Password: aB3$xY9@mN2p
----------------------------------------
Email: jane@example.com
Password: kL7!wQ5#rT8z
```

## ⚠️ Important Notes

1. **Existing Users**: If a user already exists, their info will be updated (not duplicated)
2. **Passwords**: Auto-generated passwords are secure (12 chars, mixed case, numbers, symbols)
3. **Security**: Delete credentials file after distributing to members
4. **Batch Size**: Can import any number of members in one run
5. **Errors**: Script continues even if some members fail

## 🆘 Troubleshooting

### "File not found"
- Check the file path is correct
- Use absolute path or path relative to project root

### "Invalid email format"
- Ensure emails follow: `name@domain.com` format
- Check for spaces or special characters

### "Email already exists"
- This is OK! Script will update existing user
- Check console - it will show "User already exists"

### "Missing required fields"
- Ensure email and full_name are filled for all rows
- Check spelling of column headers

## 📚 Full Documentation

For complete details, see: `docs/IMPORT_MEMBERS_GUIDE.md`

## 🎓 Examples

### Example 1: Minimal Import
```bash
# Create template
npm run create-template

# Edit member-import-template-minimal.xlsx, then:
npm run import-members ./member-import-template-minimal.xlsx
```

### Example 2: Full Import with All Fields
```bash
# Create template
npm run create-template

# Edit member-import-template-full.xlsx, then:
npm run import-members ./member-import-template-full.xlsx
```

### Example 3: Import from Desktop
```bash
npm run import-members ~/Desktop/members.xlsx
```

## 🔐 Security Best Practices

1. Don't commit Excel files with real data to git
2. Store credentials file securely
3. Send credentials via secure channels only
4. Delete credentials file after distribution
5. Ask members to change password on first login

## ⚡ Quick Commands

```bash
# Create Excel template
npm run create-template

# Import members
npm run import-members ./your-file.xlsx

# View help (in documentation)
cat docs/IMPORT_MEMBERS_GUIDE.md
```
