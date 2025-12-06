# Import Your Excel File - Custom Format Guide

## 🎯 Your Excel Format

Your Excel file has these columns:
- **Full Name** ✅ Required
- **Nick Name**
- **Department**
- **Hall**
- **Profession**
- **09.08.1971** (Date of Birth)
- **Mobile No**
- **Email** ✅ Required
- **Blood Group**
- **Present Address**
- **Home District**

## ⚡ Quick Start - Import Your File

### Step 1: Place Your Excel File
Put your Excel file anywhere accessible, for example:
- Desktop: `~/Desktop/members.xlsx`
- Project folder: `./alumni-data.xlsx`
- Documents: `~/Documents/du-alumni.xlsx`

### Step 2: Run Import Command
```bash
npm run import-members-custom path/to/your-excel-file.xlsx
```

**Examples:**
```bash
# If file is on Desktop
npm run import-members-custom ~/Desktop/members.xlsx

# If file is in project folder
npm run import-members-custom ./alumni-data.xlsx

# If file is in Downloads
npm run import-members-custom ~/Downloads/DU-Alumni-List.xlsx
```

### Step 3: Check Results
After import completes:
1. Check console output for progress
2. Find credentials file: `member-credentials-[timestamp].txt`
3. Send credentials to members securely
4. Delete credentials file after sending

## 📋 What Gets Imported

The script will map your Excel columns to the member profile:

| Your Excel Column | Stored In Database As |
|-------------------|----------------------|
| Full Name | `full_name` |
| Nick Name | `nick_name` |
| Department | `department` |
| Hall | `hall` |
| Profession | `profession` |
| 09.08.1971 | `date_of_birth` |
| Mobile No | `phone` |
| Email | `email` |
| Blood Group | `blood_group` |
| Present Address | `present_address` |
| Home District | `home_district` |

## 🔐 Auto-Generated Passwords

- Secure 12-character passwords are generated for all members
- Mix of uppercase, lowercase, numbers, and symbols
- All passwords saved to credentials file
- Members can change password after first login

## ✨ What Happens

For each row in your Excel:
1. ✅ Creates Firebase Auth account
2. ✅ Creates member profile in Firestore
3. ✅ Sets status to "approved" (members can login immediately)
4. ✅ Sets batch to "1989" (default)
5. ✅ Generates secure password
6. ✅ Saves credentials to file

## 📊 Sample Output

```
🚀 Starting member import process...

📋 Expected columns: Full Name, Nick Name, Department, Hall, 
Profession, Mobile No, Email, Blood Group, Present Address, Home District

============================================================
📖 Reading Excel file: ./members.xlsx

✅ Found 50 rows in Excel file

✅ 50 valid members to import

============================================================

Starting import...

[1/50] Creating member: john.doe@example.com
   ✅ Created auth user: abc123def456
   ✅ Created member document

[2/50] Creating member: jane.smith@example.com
   ✅ Created auth user: xyz789ghi012
   ✅ Created member document

...

============================================================

📊 IMPORT SUMMARY

✅ Successfully imported: 50
❌ Failed: 0

📄 Credentials saved to: member-credentials-2025-12-06T15-30-00-000Z.txt

✅ Import process completed!
```

## 📄 Credentials File Example

```
============================================================
MEMBER LOGIN CREDENTIALS
Generated: 12/6/2025, 3:30:00 PM
============================================================

Email: john.doe@example.com
Password: aB3$xY9@mN2p
----------------------------------------
Email: jane.smith@example.com
Password: kL7!wQ5#rT8z
----------------------------------------
```

## ⚠️ Important Requirements

### Required in Excel:
1. **Email** - Must be valid email format (name@domain.com)
2. **Full Name** - Cannot be empty

### Optional Fields:
- All other columns are optional
- Empty cells are stored as empty strings
- Script will still work if some columns are missing

## 🔄 Re-importing / Updating

**Safe to run multiple times!**

If you run the import again with the same emails:
- Existing users will be **updated** (not duplicated)
- Member profile data will be refreshed
- Passwords are **NOT changed** for existing users
- Only new members get new passwords

## ⚡ Column Name Flexibility

The script is smart about column names! It will recognize:

**For Full Name:**
- "Full Name", "FullName", "full_name", "Name"

**For Email:**
- "Email", "email", "E-mail", "Email Address"

**For Mobile:**
- "Mobile No", "Mobile", "Phone", "Mobile Number", "phone"

**And so on for all fields...**

So even if your column names have:
- Extra spaces
- Different capitalization
- Underscores vs spaces

The script will still find and map them correctly!

## 🐛 Troubleshooting

### Issue: "Row X: Missing required fields"
**Solution:** Check that row X has both Email and Full Name filled in

### Issue: "Invalid email format"
**Solution:** Make sure emails follow format: `name@domain.com`
- No spaces
- Must have @ symbol
- Must have domain (e.g., .com, .org, .bd)

### Issue: Some members failed
**Solution:** 
1. Check the error message for each failed member
2. Fix issues in Excel file
3. Re-run import (will update existing members)

### Issue: "File not found"
**Solution:** Check the file path
```bash
# Use absolute path
npm run import-members-custom /full/path/to/file.xlsx

# Or use ~ for home directory
npm run import-members-custom ~/Desktop/members.xlsx
```

## 🎯 Complete Example Workflow

```bash
# 1. Import your Excel file
npm run import-members-custom ~/Desktop/DU-Alumni-1989.xlsx

# 2. Wait for completion (will show progress for each member)

# 3. Check the credentials file
cat member-credentials-*.txt

# 4. Send credentials to members via email or secure portal

# 5. Delete credentials file
rm member-credentials-*.txt

# Done! Members can now login at your website
```

## 📧 Member Profile Fields

After import, each member profile will have:

**Authentication:**
- Email & Password (can login immediately)

**Profile Information:**
- Full Name
- Nick Name
- Email
- Department
- Hall
- Profession
- Date of Birth
- Mobile Number
- Blood Group
- Present Address
- Home District
- Status: "approved"
- Batch: "1989"

## ✅ Security Checklist

Before importing:
- [ ] Excel file is in a secure location
- [ ] Email addresses are verified and correct

After importing:
- [ ] Credentials file generated
- [ ] Credentials sent to members via secure channel (encrypted email/portal)
- [ ] Credentials file deleted from computer
- [ ] Excel file with member data stored securely (not in git repo)

## 🎓 Quick Command Reference

```bash
# Import your file (change path to match your file location)
npm run import-members-custom ~/Desktop/members.xlsx

# View credentials
cat member-credentials-*.txt

# Delete credentials after sending
rm member-credentials-*.txt
```

## 📞 Need Help?

1. Make sure Email and Full Name columns have data
2. Check that email format is correct (name@domain.com)
3. Verify file path is correct
4. Check console output for specific error messages

---

**Ready to import? Just run:**
```bash
npm run import-members-custom path/to/your/excel-file.xlsx
```

That's it! The script handles everything automatically. 🚀
