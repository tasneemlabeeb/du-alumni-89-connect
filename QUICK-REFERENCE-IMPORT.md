# 📋 Member Import - Quick Reference Card

## One-Line Commands

```bash
# Create Excel template
npm run create-template

# Import members from Excel
npm run import-members <path-to-excel-file>
```

---

## Required Excel Columns

✅ **email** - Member's email address  
✅ **full_name** - Member's full name

## Optional Excel Columns

- password (auto-generated if empty)
- batch (default: 1989)
- department
- current_location
- current_organization
- current_position
- phone
- is_admin (yes/no)
- status (approved/pending)

---

## Common Examples

### Import from current folder
```bash
npm run import-members ./members.xlsx
```

### Import from Desktop
```bash
npm run import-members ~/Desktop/members.xlsx
```

### Import with full path
```bash
npm run import-members /Users/yourname/Documents/members.xlsx
```

---

## What Gets Created

1. ✅ Firebase Auth account for each member
2. ✅ Member document in Firestore
3. ✅ Admin role (if is_admin = yes)
4. ✅ Credentials file: `member-credentials-[timestamp].txt`

---

## Quick Workflow

1. **Create template**: `npm run create-template`
2. **Edit Excel file** with member data
3. **Import**: `npm run import-members ./your-file.xlsx`
4. **Check output** in console and credentials file
5. **Send credentials** to members securely
6. **Delete credentials file** after sending

---

## Minimal Excel Example

| email              | full_name    |
|--------------------|--------------|
| john@example.com   | John Doe     |
| jane@example.com   | Jane Smith   |

---

## Full Excel Example

| email | full_name | password | batch | department | is_admin |
|-------|-----------|----------|-------|------------|----------|
| admin@duaab89.com | Admin User | Admin123 | 1989 | CS | yes |
| john@duaab89.com | John Doe | | 1989 | Economics | no |

---

## Output Files

- **Templates**: `member-import-template-[full/minimal].xlsx`
- **Credentials**: `member-credentials-[timestamp].txt`

---

## Security Checklist

- [ ] Excel file not in git repository
- [ ] Credentials file not in git repository  
- [ ] Credentials sent via secure channel
- [ ] Credentials file deleted after distribution
- [ ] Members instructed to change password

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| File not found | Use full path or check file location |
| Invalid email | Check email format in Excel |
| Missing fields | Ensure email and full_name are filled |
| xlsx not found | Run `npm install` |

---

## Documentation

- **Complete Guide**: `docs/IMPORT_MEMBERS_GUIDE.md`
- **Quick Ref**: `scripts/README-IMPORT.md`
- **Setup**: `MEMBER_IMPORT_SETUP.md`

---

## Support

1. Check console for error messages
2. Review Excel file format
3. Verify Firebase credentials in `.env.local`
4. See troubleshooting in documentation

---

## Script Features

✅ Validates data before import  
✅ Auto-generates secure passwords  
✅ Updates existing users  
✅ Assigns admin roles  
✅ Detailed progress logging  
✅ Error handling & summary  
✅ Credentials export  

---

**Last Updated**: December 6, 2025  
**Version**: 1.0
