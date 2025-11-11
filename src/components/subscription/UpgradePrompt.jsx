import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, ArrowRight } from "lucide-react";

export default function UpgradePrompt({ message, feature }) {
  return (
    <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <Crown className="h-5 w-5 text-purple-600" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-purple-900 mb-1">
            Upgrade Required
          </p>
          <p className="text-purple-800">
            {message || `${feature} is available on paid plans`}
          </p>
        </div>
        <Link to={createPageUrl("Subscription")}>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}