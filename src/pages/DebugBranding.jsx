import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function DebugBrandingContent() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const landlord = allUsers?.find(u => u.id === user?.landlord_id);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">White Label Debug Info</h1>

        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {user?.landlord_id && (
          <Card>
            <CardHeader>
              <CardTitle>Landlord Data (ID: {user.landlord_id})</CardTitle>
            </CardHeader>
            <CardContent>
              {landlord ? (
                <>
                  <div className="space-y-2 mb-4">
                    <p><strong>Company Name:</strong> {landlord.company_name || "NOT SET"}</p>
                    <p><strong>Company Logo:</strong> {landlord.company_logo || "NOT SET"}</p>
                    <p><strong>Primary Color:</strong> <span style={{ color: landlord.brand_color_primary }}>{landlord.brand_color_primary || "NOT SET"}</span></p>
                    <p><strong>Secondary Color:</strong> <span style={{ color: landlord.brand_color_secondary }}>{landlord.brand_color_secondary || "NOT SET"}</span></p>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                    {JSON.stringify(landlord, null, 2)}
                  </pre>
                </>
              ) : (
                <p className="text-red-600">Landlord user not found!</p>
              )}
            </CardContent>
          </Card>
        )}

        {!user?.landlord_id && user?.user_type === 'tenant' && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Problem Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">This tenant user does not have a landlord_id set! White labeling will not work.</p>
              <p className="mt-2">The tenant needs to be re-invited or the landlord_id needs to be set manually.</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-96">
              {JSON.stringify(allUsers, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DebugBranding() {
  return (
    <ProtectedRoute>
      <DebugBrandingContent />
    </ProtectedRoute>
  );
}