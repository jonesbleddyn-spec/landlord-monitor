import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SMSSettings() {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    use_custom_sms: user?.use_custom_sms || false,
    twilio_account_sid: user?.twilio_account_sid || "",
    twilio_auth_token: user?.twilio_auth_token || "",
    twilio_phone_number: user?.twilio_phone_number || ""
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        use_custom_sms: user.use_custom_sms || false,
        twilio_account_sid: user.twilio_account_sid || "",
        twilio_auth_token: user.twilio_auth_token || "",
        twilio_phone_number: user.twilio_phone_number || ""
      });
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("SMS settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update SMS settings");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  return (
    <Card className="shadow-xl border-none">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          SMS Notifications Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="use_custom_sms"
              checked={formData.use_custom_sms}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_custom_sms: checked }))}
            />
            <label
              htmlFor="use_custom_sms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Enable SMS notifications via Twilio
            </label>
          </div>

          {formData.use_custom_sms && (
            <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
              <div>
                <Label>Twilio Account SID *</Label>
                <Input
                  value={formData.twilio_account_sid}
                  onChange={(e) => setFormData(prev => ({ ...prev, twilio_account_sid: e.target.value }))}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <Label>Twilio Auth Token *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.twilio_auth_token}
                    onChange={(e) => setFormData(prev => ({ ...prev, twilio_auth_token: e.target.value }))}
                    placeholder="Your Twilio Auth Token"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label>Twilio Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.twilio_phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, twilio_phone_number: e.target.value }))}
                  placeholder="+1234567890"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your Twilio phone number (must include country code, e.g., +1 for US, +44 for UK)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Sign up at <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="underline">twilio.com</a></li>
                  <li>Get your Account SID and Auth Token from Console</li>
                  <li>Purchase a phone number from Twilio</li>
                  <li>Enter your credentials above</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>When enabled:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Tenants will receive SMS notifications when fault status changes</li>
                  <li>You will receive SMS notifications about new faults and updates</li>
                  <li>SMS will be sent from your Twilio phone number</li>
                </ul>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Save SMS Settings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}