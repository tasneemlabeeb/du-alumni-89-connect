import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isApprovedMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApprovedMember, setIsApprovedMember] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // Resolve loading immediately; role checks run in background
        setLoading(false);

        if (session?.user) {
          (async () => {
            try {
              const [rolesResponse, memberResponse] = await Promise.all([
                supabase.from('user_roles').select('role').eq('user_id', session.user.id),
                supabase.from('members').select('status').eq('user_id', session.user.id).maybeSingle()
              ]);

              setIsAdmin(rolesResponse.data?.some(r => r.role === 'admin') ?? false);
              setIsApprovedMember(memberResponse.data?.status === 'approved');
            } catch (error) {
              console.error('Error checking user status:', error);
              setIsAdmin(false);
              setIsApprovedMember(false);
            }
          })();
        } else {
          setIsAdmin(false);
          setIsApprovedMember(false);
        }
      }
    );

    // Initialize existing session and status
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      // Do not block UI on role checks
      setLoading(false);

      if (session?.user) {
        (async () => {
          try {
            const [rolesResponse, memberResponse] = await Promise.all([
              supabase.from('user_roles').select('role').eq('user_id', session.user.id),
              supabase.from('members').select('status').eq('user_id', session.user.id).maybeSingle()
            ]);

            setIsAdmin(rolesResponse.data?.some(r => r.role === 'admin') ?? false);
            setIsApprovedMember(memberResponse.data?.status === 'approved');
          } catch (error) {
            console.error('Error checking user status:', error);
          }
        })();
      } else {
        setIsAdmin(false);
        setIsApprovedMember(false);
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to confirm your account. Your membership application is pending approval.",
        });
      }

      return { error };
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }

      return { error };
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
    try {
      await supabase.auth.signOut();
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
      session,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin,
      isApprovedMember
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