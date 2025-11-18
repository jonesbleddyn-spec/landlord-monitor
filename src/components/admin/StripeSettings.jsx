import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Save, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StripeSettings() {
  const queryClient = useQueryClient();
  const [showSecretKey, setShowSecretKey] = useState(false);

  const { data: settings = {} } = useQuery({
    queryKey: ['stripe-settings'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getSiteSettings');
      return response.data.settings || {};
    },
  });

  const [formData, setFormData] = useState({
    stripe_enabled: settings.stripe_enabled || false,
    stripe_publishable_key: settings.stripe_publishable_key || "",
    stripe_secret_key: settings.stripe_secret_key || "",
    stripe_webhook_secret: settings.stripe_webhook_secret || ""
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        stripe_enabled: settings.stripe_enabled || false,
        stripe_publishable_key: settings.stripe_publishable_key || "",
        stripe_secret_key: settings.stripe_secret_key || "",
        stripe_webhook_secret: settings.stripe_webhook_secret || ""
      });
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('saveSiteSettings', { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-settings'] });
      toast.success("Stripe settings saved successfully");
    },
    onError: () => toast.error("Failed to save settings")
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(formData);
  };

  return (
    <Card className="shadow-xl border-none">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Stripe Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Alert>
          <AlertDescription>
            Configure Stripe to handle subscription payments. Get your API keys from{" "}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Stripe Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.stripe_enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, stripe_enabled: checked }))}
          />
          <Label>Enable Stripe Payments</Label>
        </div>

        {formData.stripe_enabled && (
          <>
            <div>
              <Label>Publishable Key</Label>
              <Input
                value={formData.stripe_publishable_key}
                onChange={(e) => setFormData(prev => ({ ...prev, stripe_publishable_key: e.target.value }))}
                placeholder="pk_test_..."
              />
              <p className="text-xs text-gray-500 mt-1">Starts with pk_test_ or pk_live_</p>
            </div>

            <div>
              <Label>Secret Key</Label>
              <div className="relative">
                <Input
                  type={showSecretKey ? "text" : "password"}
                  value={formData.stripe_secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, stripe_secret_key: e.target.value }))}
                  placeholder="sk_test_..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Starts with sk_test_ or sk_live_</p>
            </div>

            <div>
              <Label>Webhook Secret (Optional)</Label>
              <Input
                type="password"
                value={formData.stripe_webhook_secret}
                onChange={(e) => setFormData(prev => ({ ...prev, stripe_webhook_secret: e.target.value }))}
                placeholder="whsec_..."
              />
              <p className="text-xs text-gray-500 mt-1">
                For webhook signature verification. Create webhook endpoint in Stripe Dashboard.
              </p>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                <strong>Important:</strong> Make sure to create subscription prices in Stripe Dashboard 
                and add the Price IDs to your subscription plans above.
              </AlertDescription>
            </Alert>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}