import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, Users, Lock, CreditCard, Webhook, FileCode } from "lucide-react";

export default function Base44Dashboard() {
  const dashboardUrl = "https://base44.app/dashboard";

  const sections = [
    {
      title: "Entities & Database",
      description: "Manage your data models, entities, and database schema",
      icon: Database,
      color: "from-blue-500 to-cyan-500",
      url: `${dashboardUrl}/entities`
    },
    {
      title: "Authentication",
      description: "Configure authentication settings, user roles, and permissions",
      icon: Lock,
      color: "from-purple-500 to-pink-500",
      url: `${dashboardUrl}/auth`
    },
    {
      title: "Users",
      description: "View and manage all users in the system",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      url: `${dashboardUrl}/users`
    },
    {
      title: "Functions",
      description: "Manage backend functions and API endpoints",
      icon: FileCode,
      color: "from-orange-500 to-red-500",
      url: `${dashboardUrl}/functions`
    },
    {
      title: "Webhooks",
      description: "Configure and monitor webhooks",
      icon: Webhook,
      color: "from-indigo-500 to-blue-500",
      url: `${dashboardUrl}/webhooks`
    },
    {
      title: "Billing",
      description: "View billing information and usage metrics",
      icon: CreditCard,
      color: "from-pink-500 to-rose-500",
      url: `${dashboardUrl}/billing`
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Base44 Platform Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <p className="mb-4">
            Access the full Base44 dashboard to manage platform-level settings, 
            database entities, authentication, users, and more.
          </p>
          <Button 
            onClick={() => window.open(dashboardUrl, '_blank')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Base44 Dashboard
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl">
            <CardContent className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{section.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{section.description}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(section.url, '_blank')}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Quick Access Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${dashboardUrl}/settings`, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              App Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${dashboardUrl}/logs`, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Logs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`${dashboardUrl}/integrations`, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Integrations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}