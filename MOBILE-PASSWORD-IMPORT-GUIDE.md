# 🔐 Import Members with Mobile-Based Passwords

## Overview
This guide shows you how to import member accounts where passwords are automatically generated from mobile numbers.

---

## 📋 Required Excel Columns

### **Mandatory:**
- ✅ **Full Name** - Member's full name
- ✅ **Email** - Used as login username (must be valid email format)
- ✅ **Mobile No** - Used to generate password

### **Optional:**
- Nick Name
- Department
- Hall
- Profession
- Date of Birth
- Blood Group
- Present Address
- Home District

---

## 🔑 Password Generation Rules

**Formula:** Last 4 digits of Mobile No + "1234"

### Examples:

| Mobile No in Excel | First Number Extracted | Last 4 Digits | Password |
|-------------------|------------------------|---------------|----------|
| 01712345678 | 01712345678 | 5678 | 56781234 |
| 01923456789, 01812345678 | 01923456789 | 6789 | 67891234 |
| 01556789012 / 01667890123 | 01556789012 | 9012 | 90121234 |
| 01778901234 01889012345 | 01778901234 | 1234 | 12341234 |

### Multiple Numbers Handling:
If the Mobile No field contains multiple numbers separated by:
- **Commas** (`,`)
- **Slashes** (`/`)
- **Spaces**

The script will **automatically use only the FIRST number** to generate the password.

---

## 🚀 How to Use

### Step 1: Prepare Your Excel File
Make sure your Excel file has the required columns (Full Name, Email, Mobile No)

### Step 2: Run the Import Command

```bash
npm run import-members-mobile path/to/your/excel-file.xlsx
```

### Examples:

```bash
# File on Desktop
npm run import-members-mobile ~/Desktop/members.xlsx

# File in Downloads
npm run import-members-mobile ~/Downloads/alumni.xlsx

# File in current folder
npm run import-members-mobile ./my-members.xlsx
```

---

## 📊 What Happens During Import

1. ✅ Reads your Excel file
2. ✅ Validates required fields (Full Name, Email, Mobile No)
3. ✅ Generates password for each member (last 4 digits + 1234)
4. ✅ Creates user accounts in Firebase Authentication
5. ✅ Creates member profiles in Firestore database
6. ✅ Sets all members to "approved" status
7. ✅ Saves all credentials to a text file

---

## 📄 Output File

After import completes, you'll get a file named:
**`member-credentials-YYYY-MM-DD.txt`**

Example content:
```
============================================================
MEMBER LOGIN CREDENTIALS
Generated: 12/8/2025, 10:30:00 AM
Total Members: 50
============================================================

📝 PASSWORD FORMAT: Last 4 digits of mobile number + 1234

Email: john.doe@example.com
Password: 56781234
Status: NEW
----------------------------------------
Email: jane.smith@example.com
Password: 67891234
Status: NEW
----------------------------------------
```

---

## ⚠️ Important Notes

### Security:
- 🔒 **Immediately send credentials** to members through a secure channel
- 🗑️ **Delete the credentials file** after distribution
- ✉️ Consider sending each member their individual credentials via email

### Existing Members:
- If a member already exists (same email), their password will be **updated**
- The status in the credentials file will show "UPDATED"
- Member profile data will be merged/updated

### Validation:
- Invalid rows (missing required fields) will be **skipped**
- You'll see a summary showing which rows failed and why
- The import continues for all valid rows

---

## 📝 Example Excel Format

| Full Name | Nick Name | Department | Hall | Mobile No | Email | Blood Group |
|-----------|-----------|------------|------|-----------|-------|-------------|
| John Doe | Johnny | Computer Science | Hall A | 01712345678 | john@example.com | O+ |
| Jane Smith | Jane | Mathematics | Hall B | 01923456789, 01812345678 | jane@example.com | A+ |
| Bob Wilson | Bobby | Physics | Hall C | 01556789012 / 01667890123 | bob@example.com | B+ |

---

## 🎯 Password Examples

For the above members:
- **John:** Password = `56781234` (from 01712345678)
- **Jane:** Password = `67891234` (from 01923456789, first number only)
- **Bob:** Password = `90121234` (from 01556789012, first number only)

---

## 🔧 Troubleshooting

### Error: "Mobile number too short"
- Ensure mobile numbers have at least 4 digits
- Check for typos or invalid characters

### Error: "Invalid email format"
- Verify email addresses are in proper format: name@domain.com
- Check for missing @ or domain parts

### Error: "File not found"
- Double-check the file path
- Use absolute path or correct relative path
- Ensure file extension is .xlsx

### Some rows skipped
- Check the console output for specific row numbers
- Verify those rows have all required fields (Full Name, Email, Mobile No)

---

## 📞 Member Login Instructions

After importing, inform members:

1. **Username:** Their email address from the Excel file
2. **Password:** 8 digits (last 4 of their mobile + 1234)
3. **Login URL:** Your application login page
4. **Recommend:** Change password after first login

---

## ✨ Complete Workflow

```bash
# 1. Import members
npm run import-members-mobile ~/Desktop/alumni-data.xlsx

# 2. Check the credentials file
cat member-credentials-2025-12-08.txt

# 3. Distribute credentials to members
# (Send via email, WhatsApp, etc.)

# 4. Delete the credentials file for security
rm member-credentials-2025-12-08.txt
```

---

## 🎉 Success!

Once complete, all members can login using:
- **Email** as username
- **Last 4 digits of mobile + 1234** as password

Members are automatically approved and can access the platform immediately.
