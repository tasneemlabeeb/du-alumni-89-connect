'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isApprovedMember: boolean;
  profileComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApprovedMember, setIsApprovedMember] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Don't set up auth listener if Firebase isn't initialized
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);

      if (user) {
        // Check user role from 'users' collection
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData?.role === 'admin');
            setIsApprovedMember(userData?.approval_status === 'approved');
            
            // Check profile completion
            const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              // Check if mandatory fields are filled
              const mandatoryFieldsFilled = !!(
                profileData?.fullName &&
                profileData?.nickName &&
                profileData?.department &&
                profileData?.hall &&
                profileData?.contactNo &&
                profileData?.bloodGroup
              );
              setProfileComplete(mandatoryFieldsFilled);
            } else {
              setProfileComplete(false);
            }
          } else {
            // Fallback: check old user_roles collection
            const userRolesRef = collection(db, 'user_roles');
            const q = query(userRolesRef, where('user_id', '==', user.uid));
            const rolesSnapshot = await getDocs(q);
            
            const roles = rolesSnapshot.docs.map(doc => doc.data().role);
            setIsAdmin(roles.includes('admin'));

            // Check member status from old members collection
            const memberRef = doc(db, 'members', user.uid);
            const memberDoc = await getDoc(memberRef);
            
            if (memberDoc.exists()) {
              setIsApprovedMember(memberDoc.data()?.status === 'approved');
            } else {
              setIsApprovedMember(false);
            }
            setProfileComplete(false);
          }
        } catch (error: any) {
          // Silently handle permission errors for new users
          // New users won't have roles yet, which is expected
          if (error.code !== 'permission-denied') {
            console.error('Error checking user status:', error);
          }
          setIsAdmin(false);
          setIsApprovedMember(false);
          setProfileComplete(false);
        }
      } else {
        setIsAdmin(false);
        setIsApprovedMember(false);
        setProfileComplete(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    if (!auth || !db) {
      toast({
        title: "Service Unavailable",
        description: "Authentication service is not configured.",
        variant: "destructive"
      });
      return { error: new Error("Firebase not initialized") };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      const timestamp = new Date().toISOString();

      // Create user document in 'users' collection (required for admin authentication)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        full_name: fullName,
        phone_number: phoneNumber,
        role: 'user', // Default role is 'user', admin can change this
        approval_status: 'pending',
        approval_count: 0,
        approved_by_admins: [],
        email_verified: userCredential.user.emailVerified,
        profile_complete: false,
        created_at: timestamp,
        updated_at: timestamp,
      });

      // Also create member profile in 'members' collection for backward compatibility
      await setDoc(doc(db, 'members', userCredential.user.uid), {
        user_id: userCredential.user.uid,
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        status: 'pending',
        created_at: timestamp,
      });

      toast({
        title: "Registration Successful",
        description: "Please complete your profile to continue.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      toast({
        title: "Service Unavailable",
        description: "Authentication service is not configured.",
        variant: "destructive"
      });
      return { error: new Error("Firebase not initialized") };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    if (!auth) {
      return;
    }

    try {
      await firebaseSignOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin,
      isApprovedMember,
      profileComplete
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
