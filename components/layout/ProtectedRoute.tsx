'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  approvedMemberOnly?: boolean;
  requireProfileComplete?: boolean;
}

export function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  approvedMemberOnly = false,
  requireProfileComplete = false
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isApprovedMember, profileComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (adminOnly && !isAdmin) {
        router.push('/');
      }
    }
  }, [user, loading, isAdmin, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will handle redirect
  }

  if (adminOnly && !isAdmin) {
    return null; // Router will handle redirect
  }

  // Check profile completion requirement
  if (requireProfileComplete && !profileComplete && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-yellow-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Profile Incomplete</h2>
          <p className="text-slate-600 mb-6">
            Please complete your profile with all mandatory information to access member features like gallery and directory.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Required fields: Full Name, Nick Name, Department, Hall, Contact Number, and Blood Group
          </p>
          <Link href="/profile">
            <Button className="w-full">
              Complete Your Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check approval requirement
  if (approvedMemberOnly && !isApprovedMember && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-white">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-6 text-blue-600">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Membership Pending Approval</h2>
          <p className="text-slate-600 mb-6">
            Your membership application is being reviewed by our administrators. You need approval from two admins to access member-only features.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You'll receive access once your application has been approved. This usually takes 24-48 hours.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
