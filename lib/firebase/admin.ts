import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;
let adminStorageInstance: Storage | null = null;

function initializeFirebaseAdmin(): App {
  const apps = getApps();
  
  if (apps.length === 0) {
    console.log('[Firebase Admin] Initializing Firebase Admin SDK...');
    
    // Validate environment variables
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('FIREBASE_ADMIN_PROJECT_ID is not set');
    }
    if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL is not set');
    }
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      throw new Error('FIREBASE_ADMIN_PRIVATE_KEY is not set');
    }
    
    const firebaseAdminConfig = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    
    console.log('[Firebase Admin] Config:', {
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKeyLength: firebaseAdminConfig.privateKey.length
    });
    
    const app = initializeApp({
      credential: cert(firebaseAdminConfig),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    
    console.log('[Firebase Admin] Initialized successfully');
    return app;
  }
  
  return apps[0];
}

export function getFirebaseAdmin() {
  const app = initializeFirebaseAdmin();
  return {
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}

// Getter functions that initialize on first use
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    initializeFirebaseAdmin();
    adminAuthInstance = getAuth();
  }
  return adminAuthInstance;
}

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    initializeFirebaseAdmin();
    adminDbInstance = getFirestore();
  }
  return adminDbInstance;
}

export function getAdminStorage(): Storage {
  if (!adminStorageInstance) {
    initializeFirebaseAdmin();
    adminStorageInstance = getStorage();
  }
  return adminStorageInstance;
}

// Export as lazy getters for backwards compatibility
export const adminAuth = new Proxy({} as Auth, {
  get(target, prop) {
    return getAdminAuth()[prop as keyof Auth];
  }
});

export const adminDb = new Proxy({} as Firestore, {
  get(target, prop) {
    return getAdminDb()[prop as keyof Firestore];
  }
});

export const adminStorage = new Proxy({} as Storage, {
  get(target, prop) {
    return getAdminStorage()[prop as keyof Storage];
  }
});
