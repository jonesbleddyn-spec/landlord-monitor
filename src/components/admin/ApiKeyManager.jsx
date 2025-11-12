import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Check,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function ApiKeyManager() {
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState({});
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    stripe_publishable: "",
    stripe_secret: "",
    stripe_webhook_secret: "",
    facebook_app_id: "",
    facebook_app_secret: "",
    google_maps: "",
    sendgrid: "",
    twilio_account_sid: "",
    twilio_auth_token: ""
  });

  const apiKeyConfigs = [
    {
      key: "openai",
      label: "OpenAI API Key",
      description: "For AI-powered fault analysis and image recognition",
      icon: "🤖",
      placeholder: "sk-..."
    },
    {
      key: "stripe_publishable",
      label: "Stripe Publishable Key",
      description: "Stripe public key for frontend",
      icon: "💳",
      placeholder: "pk_..."
    },
    {
      key: "stripe_secret",
      label: "Stripe Secret Key",
      description: "Stripe secret key for backend transactions",
      icon: "🔐",
      placeholder: "sk_..."
    },
    {
      key: "stripe_webhook_secret",
      label: "Stripe Webhook Secret",
      description: "For verifying Stripe webhook signatures",
      icon: "🔔",
      placeholder: "whsec_..."
    },
    {
      key: "facebook_app_id",
      label: "Facebook App ID",
      description: "For social login and sharing",
      icon: "📘",
      placeholder: "..."
    },
    {
      key: "facebook_app_secret",
      label: "Facebook App Secret",
      description: "Facebook app authentication",
      icon: "🔒",
      placeholder: "..."
    },
    {
      key: "google_maps",
      label: "Google Maps API Key",
      description: "For property location services",
      icon: "🗺️",
      placeholder: "AIza..."
    },
    {
      key: "sendgrid",
      label: "SendGrid API Key",
      description: "For transactional email delivery",
      icon: "📧",
      placeholder: "SG...."
    },
    {
      key: "twilio_account_sid",
      label: "Twilio Account SID",
      description: "For SMS notifications",
      icon: "📱",
      placeholder: "AC..."
    },
    {
      key: "twilio_auth_token",
      label: "Twilio Auth Token",
      description: "Twilio authentication token",
      icon: "🔑",
      placeholder: "..."
    }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await base44.functions.invoke('saveApiKeys', { apiKeys });
      
      if (response.data.success) {
        toast.success(`API keys saved successfully! (${response.data.saved_keys.length} keys configured)`);
      } else {
        throw new Error(response.data.error || 'Failed to save API keys');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || "Failed to save API keys");
    }
    setSaving(false);
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (value) => {
    if (!value) return "";
    if (value.length <= 8) return "•".repeat(value.length);
    return value.substring(0, 4) + "•".repeat(value.length - 8) + value.substring(value.length - 4);
  };

  return (
    <div className="space-y-6">
      <Card className="border-yellow-600 bg-yellow-900/20 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-medium">Security Notice</p>
              <p className="text-sm text-yellow-300 mt-1">
                API keys are sensitive credentials. Never share them publicly or commit them to version control.
                All keys are encrypted at rest and in transit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {apiKeyConfigs.map((config) => (
          <Card key={config.key} className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <span className="text-2xl">{config.icon}</span>
                {config.label}
              </CardTitle>
              <p className="text-sm text-gray-400">{config.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showKeys[config.key] ? "text" : "password"}
                      value={apiKeys[config.key]}
                      onChange={(e) => setApiKeys(prev => ({ ...prev, [config.key]: e.target.value }))}
                      placeholder={config.placeholder}
                      className="bg-gray-700/50 border-gray-600 text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.key)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys[config.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {apiKeys[config.key] && (
                  <Badge className="bg-green-600 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Keys
            </>
          )}
        </Button>
      </div>
    </div>
  );
}