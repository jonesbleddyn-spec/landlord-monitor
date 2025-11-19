import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Save, Loader2, CheckCircle, Eye, EyeOff, AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function TwilioSettings() {
  const queryClient = useQueryClient();
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['twilio-settings'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getSiteSettings');
      return response.data.settings || {};
    },
  });

  const [formData, setFormData] = useState({
    twilio_account_sid: settings?.twilio_account_sid || "",
    twilio_auth_token: settings?.twilio_auth_token || "",
    twilio_phone_number: settings?.twilio_phone_number || "",
    twilio_enabled: settings?.twilio_enabled || false,
    sms_fault_reported: settings?.sms_fault_reported !== false,
    sms_fault_updated: settings?.sms_fault_updated !== false,
    sms_reminder_notifications: settings?.sms_reminder_notifications !== false,
    sms_compliance_alerts: settings?.sms_compliance_alerts !== false,
    sms_admin_broadcasts: settings?.sms_admin_broadcasts || false
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        twilio_account_sid: settings.twilio_account_sid || "",
        twilio_auth_token: settings.twilio_auth_token || "",
        twilio_phone_number: settings.twilio_phone_number || "",
        twilio_enabled: settings.twilio_enabled || false,
        sms_fault_reported: settings.sms_fault_reported !== false,
        sms_fault_updated: settings.sms_fault_updated !== false,
        sms_reminder_notifications: settings.sms_reminder_notifications !== false,
        sms_compliance_alerts: settings.sms_compliance_alerts !== false,
        sms_admin_broadcasts: settings.sms_admin_broadcasts || false
      });
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('saveSiteSettings', { settings: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['twilio-settings'] });
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success("Twilio settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save Twilio settings");
    }
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSettingsMutation.mutateAsync(formData);
  };

  const handleSendTest = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }

    setSendingTest(true);
    try {
      const response = await base44.functions.invoke('sendSMS', {
        to: testPhone,
        message: "This is a test SMS from Landlord Maint. Your Twilio integration is working correctly!"
      });

      if (response.data.success) {
        toast.success("Test SMS sent successfully!");
        setTestPhone("");
      } else {
        toast.error(response.data.error || "Failed to send test SMS");
      }
    } catch (error) {
      toast.error("Failed to send test SMS");
    }
    setSendingTest(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-900/20 border-blue-600">
        <Smartphone className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <strong>About Twilio SMS:</strong> Twilio enables SMS notifications for faults, reminders, and updates. 
          Get your credentials from <a href="https://www.twilio.com/console" target="_blank" rel="noopener noreferrer" className="underline">Twilio Console</a>.
          Each landlord can also configure their own Twilio settings in White Label Settings.
        </AlertDescription>
      </Alert>

      {/* Twilio Credentials */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Twilio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <Label className="text-white font-semibold">Enable SMS Notifications</Label>
              <p className="text-sm text-gray-400 mt-1">
                Turn on to enable SMS notifications across the platform
              </p>
            </div>
            <Switch
              checked={formData.twilio_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, twilio_enabled: checked }))}
            />
          </div>

          <div>
            <Label htmlFor="twilio_account_sid" className="text-white">Twilio Account SID</Label>
            <Input
              id="twilio_account_sid"
              value={formData.twilio_account_sid}
              onChange={(e) => setFormData(prev => ({ ...prev, twilio_account_sid: e.target.value }))}
              placeholder="AC..."
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="twilio_auth_token" className="text-white">Twilio Auth Token</Label>
            <div className="relative">
              <Input
                id="twilio_auth_token"
                type={showAuthToken ? "text" : "password"}
                value={formData.twilio_auth_token}
                onChange={(e) => setFormData(prev => ({ ...prev, twilio_auth_token: e.target.value }))}
                placeholder="Your auth token"
                className="bg-gray-700/50 border-gray-600 text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowAuthToken(!showAuthToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showAuthToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="twilio_phone_number" className="text-white">Twilio Phone Number</Label>
            <Input
              id="twilio_phone_number"
              value={formData.twilio_phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, twilio_phone_number: e.target.value }))}
              placeholder="+1234567890"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Include country code (e.g., +44 for UK)</p>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notification Preferences */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            SMS Notification Settings
          </CardTitle>
          <p className="text-sm text-gray-400">Choose when SMS notifications should be sent to landlords</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <Label className="text-white font-medium">Fault Reported</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Notify landlord when a new fault is reported
                </p>
              </div>
              <Switch
                checked={formData.sms_fault_reported}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_fault_reported: checked }))}
                disabled={!formData.twilio_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <Label className="text-white font-medium">Fault Status Updated</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Notify when fault status changes (to landlords and tenants)
                </p>
              </div>
              <Switch
                checked={formData.sms_fault_updated}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_fault_updated: checked }))}
                disabled={!formData.twilio_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <Label className="text-white font-medium">Reminder Notifications</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Send SMS for certificate expiry and custom reminders
                </p>
              </div>
              <Switch
                checked={formData.sms_reminder_notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_reminder_notifications: checked }))}
                disabled={!formData.twilio_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex-1">
                <Label className="text-white font-medium">Compliance Alerts</Label>
                <p className="text-sm text-gray-400 mt-1">
                  Alert landlords about expiring certificates
                </p>
              </div>
              <Switch
                checked={formData.sms_compliance_alerts}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_compliance_alerts: checked }))}
                disabled={!formData.twilio_enabled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-900/20 border border-orange-600 rounded-lg">
              <div className="flex-1">
                <Label className="text-orange-200 font-medium">Admin Broadcast Messages</Label>
                <p className="text-sm text-orange-300 mt-1">
                  Send SMS to all landlords when you post admin broadcasts
                </p>
              </div>
              <Switch
                checked={formData.sms_admin_broadcasts}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sms_admin_broadcasts: checked }))}
                disabled={!formData.twilio_enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test SMS */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+44 20 1234 5678"
              className="bg-gray-700/50 border-gray-600 text-white flex-1"
              disabled={!formData.twilio_enabled}
            />
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={!formData.twilio_enabled || sendingTest || !testPhone}
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
            >
              {sendingTest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {formData.twilio_enabled 
              ? "Send a test SMS to verify your Twilio configuration"
              : "Enable SMS notifications first to send test messages"
            }
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={saveSettingsMutation.isPending}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {saveSettingsMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}