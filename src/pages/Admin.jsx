import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BarChart3, Key, Settings, Loader2, AlertTriangle, FileText } from "lucide-react";
import AdminStats from "../components/admin/AdminStats";
import ApiKeyManager from "../components/admin/ApiKeyManager";
import SiteSettings from "../components/admin/SiteSettings";
import AdminReports from "../components/admin/AdminReports";

export default function Admin() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        base44.auth.redirectToLogin(createPageUrl("Admin"));
        return null;
      }
    },
  });

  // Check if user is super admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-6 h-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              You don't have permission to access the admin dashboard. This area is restricted to super administrators only.
            </p>
            <button
              onClick={() => navigate(createPageUrl("Home"))}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Super Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage platform settings and monitor activity</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="data-[state=active]:bg-purple-600">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-green-600">
              <Settings className="w-4 h-4 mr-2" />
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminStats />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}