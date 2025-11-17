import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, Zap, Database, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AppSettings() {
  const settings = [
    {
      icon: Database,
      title: "Database",
      description: "PostgreSQL with automatic backups",
      status: "healthy",
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Performance",
      description: "CDN enabled, optimized queries",
      status: "optimal",
      color: "text-green-400"
    },
    {
      icon: Code,
      title: "API",
      description: "REST API with rate limiting",
      status: "active",
      color: "text-purple-400"
    }
  ];

  const quickLinks = [
    { label: "Environment Variables", url: "https://base44.app/dashboard/settings/env" },
    { label: "Domain Settings", url: "https://base44.app/dashboard/settings/domain" },
    { label: "Deployment", url: "https://base44.app/dashboard/settings/deployment" },
    { label: "Logs", url: "https://base44.app/dashboard/logs" },
    { label: "Analytics", url: "https://base44.app/dashboard/analytics" },
    { label: "Billing", url: "https://base44.app/dashboard/billing" }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Application Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {settings.map((setting) => (
              <Card key={setting.title} className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <setting.icon className={`w-8 h-8 mb-3 ${setting.color}`} />
                  <p className="font-semibold text-white mb-1">{setting.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{setting.description}</p>
                  <Badge className="bg-green-600 text-xs">{setting.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-white font-semibold mb-3">App Information</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400">Platform</p>
                <p className="text-white font-mono">Base44 v3</p>
              </div>
              <div>
                <p className="text-gray-400">Framework</p>
                <p className="text-white font-mono">React + Tailwind</p>
              </div>
              <div>
                <p className="text-gray-400">Database</p>
                <p className="text-white font-mono">PostgreSQL</p>
              </div>
              <div>
                <p className="text-gray-400">Region</p>
                <p className="text-white font-mono">Auto</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <div className="grid md:grid-cols-3 gap-2">
              {quickLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-between"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}