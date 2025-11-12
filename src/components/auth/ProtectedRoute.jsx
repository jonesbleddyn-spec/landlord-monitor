import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Shield } from "lucide-react";

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, 
  requiredUserType = null,
  allowedRoles = [],
  redirectTo = null 
}) {
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (err) {
        return null;
      }
    },
  });

  React.useEffect(() => {
    if (!isLoading) {
      // If no user, redirect to login
      if (!user) {
        base44.auth.redirectToLogin(redirectTo || window.location.pathname);
        return;
      }

      // Check for required role (admin, user, etc.)
      if (requiredRole && user.role !== requiredRole) {
        navigate(createPageUrl("Home"));
        return;
      }

      // Check for allowed roles (can be multiple)
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        navigate(createPageUrl("Home"));
        return;
      }

      // Check for required user type (landlord, tenant)
      if (requiredUserType && user.user_type !== requiredUserType) {
        navigate(createPageUrl("Home"));
        return;
      }

      // If onboarding not completed, redirect to onboarding
      if (!user.onboarding_completed && window.location.pathname !== createPageUrl("Onboarding")) {
        navigate(createPageUrl("Onboarding"));
        return;
      }
    }
  }, [user, isLoading, requiredRole, requiredUserType, allowedRoles, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role/type restrictions
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredUserType && user.user_type !== requiredUserType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to {requiredUserType}s.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}