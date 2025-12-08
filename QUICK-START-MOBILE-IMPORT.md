# 🚀 Quick Start: Import Members with Mobile-Based Passwords

## One-Command Import

```bash
npm run import-members-mobile path/to/your/excel-file.xlsx
```

---

## Password Format
**Last 4 digits of Mobile No + "1234"**

Examples:
- Mobile: `01712345678` → Password: `56781234`
- Mobile: `01923456789, 01812345678` → Password: `67891234` (uses first number)

---

## Required Excel Columns
1. ✅ **Full Name**
2. ✅ **Email** (used as login username)
3. ✅ **Mobile No** (used to generate password)

---

## Quick Examples

```bash
# Desktop file
npm run import-members-mobile ~/Desktop/members.xlsx

# Downloads folder
npm run import-members-mobile ~/Downloads/alumni.xlsx

# Current directory
npm run import-members-mobile ./members.xlsx
```

---

## After Import

1. Check output file: `member-credentials-YYYY-MM-DD.txt`
2. Send credentials to members securely
3. Delete credentials file: `rm member-credentials-*.txt`

---

## 📖 Full Documentation
See [MOBILE-PASSWORD-IMPORT-GUIDE.md](./MOBILE-PASSWORD-IMPORT-GUIDE.md) for complete details.
