import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BarChart3, Key, Settings, FileText, Megaphone, Database } from "lucide-react";
import AdminStats from "../components/admin/AdminStats";
import ApiKeyManager from "../components/admin/ApiKeyManager";
import SiteSettings from "../components/admin/SiteSettings";
import AdminReports from "../components/admin/AdminReports";
import AdminBroadcast from "../components/admin/AdminBroadcast";
import Base44Dashboard from "../components/admin/Base44Dashboard";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function AdminContent() {
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
            <TabsTrigger value="broadcasts" className="data-[state=active]:bg-red-600">
              <Megaphone className="w-4 h-4 mr-2" />
              Broadcasts
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-orange-600">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="base44" className="data-[state=active]:bg-indigo-600">
              <Database className="w-4 h-4 mr-2" />
              Base44 Dashboard
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

          <TabsContent value="broadcasts">
            <AdminBroadcast />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="base44">
            <Base44Dashboard />
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

export default function Admin() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}