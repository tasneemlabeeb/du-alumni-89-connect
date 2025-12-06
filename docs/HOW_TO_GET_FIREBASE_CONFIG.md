# How to Get Firebase Web App Configuration

## Current Situation
You have **Firebase Admin SDK (Service Account)** credentials, but you need **Firebase Web SDK** credentials for your React app.

## Steps to Get Web App Config:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/duaab89-67c12/settings/general

### 2. Scroll to "Your apps" section
Look for a section that says "Your apps" or "Firebase SDK snippet"

### 3. Add a Web App (if none exists)
- Click the **</>** (web) icon to add a web app
- Give it a nickname like "Alumni Connect Web App"
- Click "Register app"

### 4. Copy the Configuration
You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",  // This is a PUBLIC key - it's safe in frontend code
  authDomain: "duaab89-67c12.firebaseapp.com",
  projectId: "duaab89-67c12",
  storageBucket: "duaab89-67c12.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

## Can't Find It? Try This:
1. Go to: https://console.firebase.google.com/project/duaab89-67c12/overview
2. Look for a **gear icon** ⚙️ near "Project Overview"
3. Click "Project settings"
4. Scroll down to "Your apps"
5. If you see **"There are no apps in your project"**, click "Add app" → Web

## Alternative: Use Firebase CLI
Run this command to see all your apps:
```bash
firebase projects:list
firebase apps:list
```

---

## What You Have vs What You Need

### ❌ What You Have (Service Account - Backend Only):
```json
{
  "type": "service_account",
  "project_id": "duaab89-67c12",
  "private_key": "-----BEGIN PRIVATE KEY-----...",
  "client_email": "firebase-adminsdk-fbsvc@..."
}
```
- **Used for:** Backend servers, Cloud Functions, Admin operations
- **Security:** MUST be kept secret, never in frontend code

### ✅ What You Need (Web App Config - Frontend):
```javascript
{
  apiKey: "AIza...",  // Public, safe to expose
  authDomain: "duaab89-67c12.firebaseapp.com",
  projectId: "duaab89-67c12",
  storageBucket: "duaab89-67c12.firebasestorage.app",
  messagingSenderId: "...",
  appId: "1:...:web:..."
}
```
- **Used for:** React, Vue, Angular, or any frontend web app
- **Security:** Safe to expose publicly (protected by Firebase rules)

---

## 🚨 IMPORTANT: Delete Service Account Credentials
The private keys you shared should be:
1. **Deleted from chat history**
2. **Regenerated in Firebase Console** (since they were exposed)
3. **Never committed to Git**

To regenerate:
1. Go to: https://console.firebase.google.com/project/duaab89-67c12/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Store securely (only for backend use)
