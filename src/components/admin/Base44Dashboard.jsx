import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Users, FileCode, Settings, Zap } from "lucide-react";
import EntityManager from "./base44/EntityManager";
import UserManager from "./base44/UserManager";
import FunctionManager from "./base44/FunctionManager";
import AuthSettings from "./base44/AuthSettings";
import AppSettings from "./base44/AppSettings";

export default function Base44Dashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="entities" className="data-[state=active]:bg-blue-600">
            <Database className="w-4 h-4 mr-2" />
            Entities
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-green-600">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="functions" className="data-[state=active]:bg-orange-600">
            <FileCode className="w-4 h-4 mr-2" />
            Functions
          </TabsTrigger>
          <TabsTrigger value="auth" className="data-[state=active]:bg-purple-600">
            <Zap className="w-4 h-4 mr-2" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="app" className="data-[state=active]:bg-indigo-600">
            <Settings className="w-4 h-4 mr-2" />
            App Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entities">
          <EntityManager />
        </TabsContent>

        <TabsContent value="users">
          <UserManager />
        </TabsContent>

        <TabsContent value="functions">
          <FunctionManager />
        </TabsContent>

        <TabsContent value="auth">
          <AuthSettings />
        </TabsContent>

        <TabsContent value="app">
          <AppSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}