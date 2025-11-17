import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ExternalLink, Shield, Mail, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuthSettings() {
  const authFeatures = [
    { 
      icon: Shield, 
      title: "User Roles", 
      description: "Admin, Landlord, Tenant roles configured",
      status: "active",
      color: "text-blue-400"
    },
    { 
      icon: Mail, 
      title: "Email Authentication", 
      description: "Email/password login enabled",
      status: "active",
      color: "text-green-400"
    },
    { 
      icon: Lock, 
      title: "Protected Routes", 
      description: "Role-based access control active",
      status: "active",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Authentication Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {authFeatures.map((feature) => (
              <Card key={feature.title} className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <feature.icon className={`w-8 h-8 mb-3 ${feature.color}`} />
                  <p className="font-semibold text-white mb-1">{feature.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{feature.description}</p>
                  <Badge className="bg-green-600 text-xs">{feature.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-white font-semibold mb-2">Current Configuration</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Role-based authentication enabled</li>
              <li>✓ Protected routes for admin, landlord, and tenant</li>
              <li>✓ Session management active</li>
              <li>✓ Onboarding flow configured</li>
            </ul>
          </div>

          <Button
            onClick={() => window.open('https://base44.app/dashboard/auth', '_blank')}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Auth Settings in Base44
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}