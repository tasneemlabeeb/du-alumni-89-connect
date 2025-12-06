'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  approvedMemberOnly?: boolean;
}

export function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  approvedMemberOnly = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isApprovedMember } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
      } else if (adminOnly && !isAdmin) {
        router.push('/');
      } else if (approvedMemberOnly && !isApprovedMember) {
        // Show pending approval message instead of redirecting
        return;
      }
    }
  }, [user, loading, isAdmin, isApprovedMember, adminOnly, approvedMemberOnly, router]);

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

  if (approvedMemberOnly && !isApprovedMember) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Membership Pending Approval</h2>
          <p className="text-muted-foreground">
            Your membership application is pending approval. Please wait for an admin to approve your request.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
