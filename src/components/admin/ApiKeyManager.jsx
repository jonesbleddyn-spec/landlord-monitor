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
    openai: ""
  });

  const apiKeyConfigs = [
    {
      key: "openai",
      label: "OpenAI API Key",
      description: "Required for AI-powered fault analysis, image recognition, and DIY tips generation",
      icon: "🤖",
      placeholder: "sk-...",
      required: true
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
      <Card className="border-blue-600 bg-blue-900/20 backdrop-blur">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-200 font-medium text-lg mb-2">Self-Hosting Configuration</p>
                <p className="text-sm text-blue-300 mb-4">
                  These API keys are required if you're hosting this application outside of Base44. 
                  On Base44, these integrations are managed automatically through the platform.
                </p>
                <div className="bg-blue-950/50 rounded-lg p-4 border border-blue-800">
                  <p className="text-blue-200 font-semibold mb-2">🚀 To Host Elsewhere:</p>
                  <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Export your app code from Base44</li>
                    <li>Set up a Node.js/React hosting environment (Vercel, Netlify, AWS, etc.)</li>
                    <li>Configure these API keys as environment variables</li>
                    <li>Set up your database (PostgreSQL recommended)</li>
                    <li>Configure Stripe keys in the Stripe Settings tab</li>
                    <li>Configure SMTP settings in Site Settings for email delivery</li>
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-medium">Security Notice</p>
                <p className="text-sm text-yellow-300">
                  Never share API keys publicly or commit them to version control. Use environment variables.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {apiKeyConfigs.map((config) => (
          <Card key={config.key} className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <span className="text-2xl">{config.icon}</span>
                {config.label}
                {config.required && (
                  <Badge className="bg-red-600 text-white ml-2">Required</Badge>
                )}
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