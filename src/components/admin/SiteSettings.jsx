import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Mail, 
  Server, 
  Shield,
  Save,
  Loader2,
  Database,
  Globe,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function SiteSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // SMTP Settings
    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
    smtp_from_email: "",
    smtp_from_name: "Landlord Monitor",
    smtp_use_tls: true,
    
    // General Settings
    site_name: "Landlord Monitor",
    site_url: "",
    support_email: "support@landlordmonitor.com",
    
    // Maintenance Mode
    maintenance_mode: false,
    maintenance_message: "We're currently performing scheduled maintenance. We'll be back soon!",
    
    // Security
    max_login_attempts: "5",
    session_timeout: "24",
    require_email_verification: true,
    
    // Storage
    max_file_size: "10",
    allowed_file_types: "jpg,jpeg,png,pdf,doc,docx"
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await base44.functions.invoke('saveSiteSettings', settings);
      
      if (response.data.success) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(response.data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || "Failed to save settings");
    }
    setSaving(false);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SMTP Email Configuration
          </CardTitle>
          <p className="text-sm text-gray-400">Configure third-party email service for transactional emails</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">SMTP Host *</Label>
              <Input
                value={settings.smtp_host}
                onChange={(e) => updateSetting('smtp_host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">SMTP Port *</Label>
              <Input
                value={settings.smtp_port}
                onChange={(e) => updateSetting('smtp_port', e.target.value)}
                placeholder="587"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">SMTP Username *</Label>
              <Input
                value={settings.smtp_username}
                onChange={(e) => updateSetting('smtp_username', e.target.value)}
                placeholder="your-email@example.com"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">SMTP Password *</Label>
              <Input
                type="password"
                value={settings.smtp_password}
                onChange={(e) => updateSetting('smtp_password', e.target.value)}
                placeholder="••••••••"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">From Email *</Label>
              <Input
                value={settings.smtp_from_email}
                onChange={(e) => updateSetting('smtp_from_email', e.target.value)}
                placeholder="noreply@landlordmonitor.com"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">From Name</Label>
              <Input
                value={settings.smtp_from_name}
                onChange={(e) => updateSetting('smtp_from_name', e.target.value)}
                placeholder="Landlord Monitor"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-gray-300">Use TLS/SSL</Label>
              <p className="text-sm text-gray-500">Enable secure connection</p>
            </div>
            <Switch
              checked={settings.smtp_use_tls}
              onCheckedChange={(checked) => updateSetting('smtp_use_tls', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Site Name</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => updateSetting('site_name', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Site URL</Label>
              <Input
                value={settings.site_url}
                onChange={(e) => updateSetting('site_url', e.target.value)}
                placeholder="https://landlordmonitor.com"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Support Email</Label>
            <Input
              value={settings.support_email}
              onChange={(e) => updateSetting('support_email', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Mode */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-gray-300">Enable Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Prevent users from accessing the site</p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
            />
          </div>

          <div>
            <Label className="text-gray-300">Maintenance Message</Label>
            <Textarea
              value={settings.maintenance_message}
              onChange={(e) => updateSetting('maintenance_message', e.target.value)}
              rows={3}
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.max_login_attempts}
                onChange={(e) => updateSetting('max_login_attempts', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Session Timeout (hours)</Label>
              <Input
                type="number"
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', e.target.value)}
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <Label className="text-gray-300">Require Email Verification</Label>
              <p className="text-sm text-gray-500">Users must verify email before accessing platform</p>
            </div>
            <Switch
              checked={settings.require_email_verification}
              onCheckedChange={(checked) => updateSetting('require_email_verification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Settings */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="w-5 h-5" />
            Storage & Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Max File Size (MB)</Label>
            <Input
              type="number"
              value={settings.max_file_size}
              onChange={(e) => updateSetting('max_file_size', e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Allowed File Types</Label>
            <Input
              value={settings.allowed_file_types}
              onChange={(e) => updateSetting('allowed_file_types', e.target.value)}
              placeholder="jpg,png,pdf"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of file extensions</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}