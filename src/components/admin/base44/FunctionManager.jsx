import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function FunctionManager() {
  const functions = [
    { name: "inviteTenant", description: "Send tenant invitations", status: "active" },
    { name: "notifyFaultUpdate", description: "Email notifications for faults", status: "active" },
    { name: "generatePropertyReport", description: "Generate PDF reports", status: "active" },
    { name: "bulkImportProperties", description: "Import properties from CSV", status: "active" },
    { name: "checkExpiredDocuments", description: "Check for expired documents", status: "active" },
    { name: "checkComplianceReminders", description: "Send compliance reminders", status: "active" },
    { name: "redeemInvitation", description: "Process tenant invitations", status: "active" },
    { name: "changeSubscriptionPlan", description: "Manage subscriptions", status: "active" },
    { name: "checkSubscriptionLimits", description: "Validate subscription limits", status: "active" },
    { name: "submitPublicFault", description: "Public fault submission", status: "active" },
    { name: "saveApiKeys", description: "Save API credentials", status: "active" },
    { name: "saveSiteSettings", description: "Update site settings", status: "active" },
    { name: "getSiteSettings", description: "Retrieve site settings", status: "active" },
    { name: "deleteUser", description: "Delete user accounts", status: "active" },
    { name: "changeUserPlan", description: "Change user subscription", status: "active" },
    { name: "getUserData", description: "Get user information", status: "active" }
  ];

  const handleViewFunction = (functionName) => {
    window.open(`https://base44.app/dashboard/functions/${functionName}`, '_blank');
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileCode className="w-5 h-5 text-orange-400" />
          Backend Functions ({functions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {functions.map((func) => (
            <Card key={func.name} className="bg-gray-700 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white font-mono text-sm">{func.name}</p>
                      <Badge className="bg-green-600 text-xs">{func.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">{func.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewFunction(func.name)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400">
            💡 To edit function code, click the external link icon to open in Base44 dashboard
          </p>
        </div>
      </CardContent>
    </Card>
  );
}