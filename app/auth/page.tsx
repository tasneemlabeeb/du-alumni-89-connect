'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import { Users, LogIn, UserPlus, KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// Validation schemas
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().trim().min(1, { message: "Full name is required" }),
  phoneNumber: z.string().trim().min(10, { message: "Valid phone number is required" }),
});

const pinSchema = z.object({
  pin: z.string().length(4, { message: "PIN must be 4 digits" }).regex(/^\d+$/, { message: "PIN must contain only numbers" }),
});

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const { user, signIn, signUp, signOut, isAdmin, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial tab from query param
  const mode = searchParams.get('mode');
  const emailParam = searchParams.get('email') || '';
  const initialTab = mode === 'signin' ? 'signin' : 'signup';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update active tab when mode query param changes
  useEffect(() => {
    if (mode === 'signup') {
      setActiveTab('signup');
    } else if (mode === 'signin') {
      setActiveTab('signin');
    }
  }, [mode]);

  // Update form email when email query param changes
  useEffect(() => {
    if (emailParam) {
      setSignInForm(prev => ({ ...prev, email: emailParam }));
      setSignUpForm(prev => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  // Form states
  const [signInForm, setSignInForm] = useState({ email: emailParam, password: '' });
  const [signUpForm, setSignUpForm] = useState({ email: emailParam, password: '', fullName: '', phoneNumber: '' });
  const [resetForm, setResetForm] = useState({ email: '' });
  const [pinForm, setPinForm] = useState({ pin: '' });
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPinStep, setShowPinStep] = useState(false);
  const [showSignUpPinStep, setShowSignUpPinStep] = useState(false);
  const [tempCredentials, setTempCredentials] = useState({ email: '', password: '' });
  const [tempSignUpData, setTempSignUpData] = useState({ email: '', password: '', fullName: '', phoneNumber: '' });
  const [devPin, setDevPin] = useState<string | null>(null);

  // Redirect if already authenticated - use useEffect to avoid setState during render
  // But don't redirect if we're in the middle of PIN verification
  useEffect(() => {
    if (user && !loading && !showPinStep && !showSignUpPinStep) {
      // Redirect admins to admin panel, regular users to home
      router.push(isAdmin ? '/admin' : '/');
    }
  }, [user, isAdmin, loading, router, showPinStep, showSignUpPinStep]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      signInSchema.parse(signInForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setSignInLoading(true);
    
    try {
      // Send PIN to email without signing in yet
      const response = await fetch('/api/auth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signInForm.email,
          password: signInForm.password // Send password to verify credentials
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials or failed to send PIN');
      }

      // Store credentials temporarily for final sign-in after PIN verification
      setTempCredentials({ email: signInForm.email, password: signInForm.password });
      
      // Show PIN in development mode if email failed
      if (data.devPin) {
        setDevPin(data.devPin);
        toast.success(`PIN sent! (Dev mode: ${data.devPin})`);
      } else {
        toast.success('Verification code sent to your email');
      }
      
      // Show PIN input step
      setShowPinStep(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process sign-in');
    } finally {
      setSignInLoading(false);
    }
  };

  const handlePinVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      pinSchema.parse(pinForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setPinLoading(true);

    try {
      // Verify PIN
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: tempCredentials.email, 
          pin: pinForm.pin 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid PIN');
      }

      // PIN verified successfully, now complete the sign-in
      const { error } = await signIn(tempCredentials.email, tempCredentials.password);
      
      if (error) {
        toast.error('Sign-in failed. Please try again.');
      } else {
        toast.success('Successfully signed in!');
        // Reset forms
        setSignInForm({ email: '', password: '' });
        setPinForm({ pin: '' });
        setShowPinStep(false);
        setTempCredentials({ email: '', password: '' });
        setDevPin(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'PIN verification failed');
    } finally {
      setPinLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowPinStep(false);
    setPinForm({ pin: '' });
    setTempCredentials({ email: '', password: '' });
    setDevPin(null);
  };

  const handleResendPin = async () => {
    setPinLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempCredentials.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend PIN');
      }

      if (data.devPin) {
        setDevPin(data.devPin);
        toast.success(`New PIN sent! (Dev mode: ${data.devPin})`);
      } else {
        toast.success('New verification code sent to your email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      signUpSchema.parse(signUpForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setSignUpLoading(true);
    
    try {
      // Send PIN to email before creating account
      const response = await fetch('/api/auth/send-signup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signUpForm.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // Store signup data temporarily for final registration after PIN verification
      setTempSignUpData({ 
        email: signUpForm.email, 
        password: signUpForm.password,
        fullName: signUpForm.fullName,
        phoneNumber: signUpForm.phoneNumber
      });
      
      // Show PIN in development mode if email failed
      if (data.devPin) {
        setDevPin(data.devPin);
        toast.success(`Verification code sent! (Dev mode: ${data.devPin})`);
      } else {
        toast.success('Verification code sent to your email');
      }
      
      // Show PIN input step
      setShowSignUpPinStep(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignUpPinVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      pinSchema.parse(pinForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setPinLoading(true);

    try {
      // Verify PIN
      const response = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: tempSignUpData.email, 
          pin: pinForm.pin 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid PIN');
      }

      // PIN verified successfully, now create the account
      const { error } = await signUp(
        tempSignUpData.email, 
        tempSignUpData.password, 
        tempSignUpData.fullName, 
        tempSignUpData.phoneNumber
      );
      
      if (error) {
        toast.error('Account creation failed. Please try again.');
      } else {
        toast.success('Account created successfully! Please complete your profile.');
        setSignUpForm({ email: '', password: '', fullName: '', phoneNumber: '' });
        setPinForm({ pin: '' });
        setShowSignUpPinStep(false);
        setTempSignUpData({ email: '', password: '', fullName: '', phoneNumber: '' });
        setDevPin(null);
        // Redirect to profile page after successful signup
        router.push('/profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'PIN verification failed');
    } finally {
      setPinLoading(false);
    }
  };

  const handleBackToSignUp = () => {
    setShowSignUpPinStep(false);
    setPinForm({ pin: '' });
    setTempSignUpData({ email: '', password: '', fullName: '', phoneNumber: '' });
    setDevPin(null);
  };

  const handleResendSignUpPin = async () => {
    setPinLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-signup-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempSignUpData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend PIN');
      }

      if (data.devPin) {
        setDevPin(data.devPin);
        toast.success(`New code sent! (Dev mode: ${data.devPin})`);
      } else {
        toast.success('New verification code sent to your email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend PIN');
    } finally {
      setPinLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      signInSchema.pick({ email: true }).parse(resetForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
    }

    setResetLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, resetForm.email);
      toast.success('Password reset email sent! Check your inbox.');
      setResetEmailSent(true);
      setResetForm({ email: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    }
    
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Users className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">DU Alumni '89</h1>
          <p className="text-gray-600 mt-2">Connect with your fellow alumni</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signup">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up
            </TabsTrigger>
            <TabsTrigger value="signin">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="reset">
              <KeyRound className="h-4 w-4 mr-2" />
              Reset
            </TabsTrigger>
          </TabsList>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showSignUpPinStep ? 'Verify Your Email' : 'Create Account'}
                </CardTitle>
                <CardDescription>
                  {showSignUpPinStep 
                    ? 'Enter the 4-digit code sent to your email'
                    : 'Join the DU Alumni \'89 community'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showSignUpPinStep ? (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      value={signUpForm.phoneNumber}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={signUpLoading}>
                    {signUpLoading ? 'Sending code...' : 'Continue'}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Your membership will be pending approval by an admin.
                  </p>
                </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            Email Verification Required
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            We've sent a 4-digit code to <span className="font-medium">{tempSignUpData.email}</span>
                          </p>
                          {devPin && (
                            <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-100 p-2 rounded">
                              Development Mode: {devPin}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSignUpPinVerification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-pin">Verification Code</Label>
                        <Input
                          id="signup-pin"
                          type="text"
                          placeholder="Enter 4-digit code"
                          value={pinForm.pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPinForm({ pin: value });
                          }}
                          maxLength={4}
                          className="text-center text-2xl tracking-widest font-mono"
                          required
                          autoFocus
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={pinLoading}>
                        {pinLoading ? 'Verifying...' : 'Verify & Create Account'}
                      </Button>
                    </form>

                    <div className="space-y-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleResendSignUpPin}
                        disabled={pinLoading}
                      >
                        Resend Code
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={handleBackToSignUp}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sign Up
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Code expires in 5 minutes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>
                  {showPinStep ? 'Verification Code' : 'Welcome Back'}
                </CardTitle>
                <CardDescription>
                  {showPinStep 
                    ? 'Enter the 4-digit code sent to your email'
                    : 'Sign in to your account to continue'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showPinStep ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={signInLoading}>
                      {signInLoading ? 'Verifying...' : 'Continue'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            Two-Step Verification
                          </p>
                          <p className="text-sm text-blue-700 mt-1">
                            We've sent a 4-digit code to <span className="font-medium">{tempCredentials.email}</span>
                          </p>
                          {devPin && (
                            <p className="text-xs text-blue-600 mt-2 font-mono bg-blue-100 p-2 rounded">
                              Development Mode: {devPin}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePinVerification} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="pin">Verification Code</Label>
                        <Input
                          id="pin"
                          type="text"
                          placeholder="Enter 4-digit code"
                          value={pinForm.pin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setPinForm({ pin: value });
                          }}
                          maxLength={4}
                          className="text-center text-2xl tracking-widest font-mono"
                          required
                          autoFocus
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={pinLoading}>
                        {pinLoading ? 'Verifying...' : 'Verify & Sign In'}
                      </Button>
                    </form>

                    <div className="space-y-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleResendPin}
                        disabled={pinLoading}
                      >
                        Resend Code
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={handleBackToLogin}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Login
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Code expires in 5 minutes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Reset Tab */}
          <TabsContent value="reset">
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  {resetEmailSent 
                    ? 'Check your email for reset instructions' 
                    : 'Enter your email to receive a reset link'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!resetEmailSent ? (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetForm.email}
                        onChange={(e) => setResetForm({ email: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      {resetLoading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to your email address.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setResetEmailSent(false)}
                      className="w-full"
                    >
                      Send Another Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
