import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BarChart3, Key, Settings, FileText, Megaphone, Mail, Activity, CreditCard, Smartphone } from "lucide-react";
import AdminStats from "../components/admin/AdminStats";
import ApiKeyManager from "../components/admin/ApiKeyManager";
import SiteSettings from "../components/admin/SiteSettings";
import AdminReports from "../components/admin/AdminReports";
import AdminBroadcast from "../components/admin/AdminBroadcast";
import EmailMarketing from "../components/admin/EmailMarketing";
import ThirdPartyServices from "../components/admin/ThirdPartyServices";
import SubscriptionPlans from "../components/admin/SubscriptionPlans";
import StripeSettings from "../components/admin/StripeSettings";
import TwilioSettings from "../components/admin/TwilioSettings";
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
          <div className="overflow-x-auto">
            <TabsList className="bg-gray-800 border border-gray-700 flex-wrap h-auto justify-start">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 whitespace-nowrap">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="broadcasts" className="data-[state=active]:bg-red-600 whitespace-nowrap">
                <Megaphone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Broadcasts</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-cyan-600 whitespace-nowrap">
                <Mail className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-orange-600 whitespace-nowrap">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-pink-600 whitespace-nowrap">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="stripe" className="data-[state=active]:bg-indigo-600 whitespace-nowrap">
                <CreditCard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Stripe</span>
              </TabsTrigger>
              <TabsTrigger value="twilio" className="data-[state=active]:bg-teal-600 whitespace-nowrap">
                <Smartphone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Twilio SMS</span>
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Key className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-green-600 whitespace-nowrap">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-indigo-600 whitespace-nowrap">
                <Activity className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Services</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminStats />
          </TabsContent>

          <TabsContent value="broadcasts">
            <AdminBroadcast />
          </TabsContent>

          <TabsContent value="email">
            <EmailMarketing />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReports />
          </TabsContent>

          <TabsContent value="plans">
            <SubscriptionPlans />
          </TabsContent>

          <TabsContent value="stripe">
            <StripeSettings />
          </TabsContent>

          <TabsContent value="twilio">
            <TwilioSettings />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettings />
          </TabsContent>

          <TabsContent value="services">
            <ThirdPartyServices />
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