import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
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