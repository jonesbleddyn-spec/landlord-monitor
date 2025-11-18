import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Upload, Loader2, CheckCircle, Mail, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function WhiteLabelSettingsContent() {
  const queryClient = useQueryClient();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const [formData, setFormData] = useState({
    company_name: user?.company_name || "",
    company_logo: user?.company_logo || "",
    brand_color_primary: user?.brand_color_primary || "#3B82F6",
    brand_color_secondary: user?.brand_color_secondary || "#8B5CF6",
    use_custom_smtp: user?.use_custom_smtp || false,
    smtp_host: user?.smtp_host || "",
    smtp_port: user?.smtp_port || 587,
    smtp_username: user?.smtp_username || "",
    smtp_password: user?.smtp_password || "",
    smtp_from_email: user?.smtp_from_email || "",
    smtp_from_name: user?.smtp_from_name || ""
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        company_name: user.company_name || "",
        company_logo: user.company_logo || "",
        brand_color_primary: user.brand_color_primary || "#3B82F6",
        brand_color_secondary: user.brand_color_secondary || "#8B5CF6",
        use_custom_smtp: user.use_custom_smtp || false,
        smtp_host: user.smtp_host || "",
        smtp_port: user.smtp_port || 587,
        smtp_username: user.smtp_username || "",
        smtp_password: user.smtp_password || "",
        smtp_from_email: user.smtp_from_email || "",
        smtp_from_name: user.smtp_from_name || ""
      });
    }
  }, [user]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success("White label settings updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update settings");
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, company_logo: file_url }));
      toast.success("Logo uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload logo");
    }
    setUploadingLogo(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">White Label Settings</h1>
          <p className="text-lg text-gray-600">
            Customize your branding for tenant-facing pages
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Branding Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your Company Name"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be displayed to your tenants
                </p>
              </div>

              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 space-y-4">
                  {formData.company_logo && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                      <img
                        src={formData.company_logo}
                        alt="Company Logo"
                        className="h-16 w-auto object-contain"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, company_logo: "" }))}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">
                      {uploadingLogo ? "Uploading..." : "Click to upload logo"}
                    </span>
                  </label>
                  <p className="text-sm text-gray-500">
                    PNG or JPG. Recommended size: 200x60px
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Primary Brand Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={formData.brand_color_primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_primary: e.target.value }))}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.brand_color_primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_primary: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Secondary Brand Color</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="color"
                      value={formData.brand_color_secondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_secondary: e.target.value }))}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.brand_color_secondary}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand_color_secondary: e.target.value }))}
                      placeholder="#8B5CF6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Preview</h4>
                <div 
                  className="p-6 rounded-lg text-white"
                  style={{
                    background: `linear-gradient(to right, ${formData.brand_color_primary}, ${formData.brand_color_secondary})`
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {formData.company_logo && (
                      <img
                        src={formData.company_logo}
                        alt="Logo"
                        className="h-10 bg-white p-2 rounded"
                      />
                    )}
                    <span className="text-xl font-bold">
                      {formData.company_name || "Your Company"}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">
                    This is how your branding will appear to tenants
                  </p>
                </div>
              </div>

              {/* Custom Email Provider Section */}
              <div className="border-t pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Custom Email Provider</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Configure your own SMTP server so emails to tenants appear to come from your domain
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="use_custom_smtp"
                    checked={formData.use_custom_smtp}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_custom_smtp: checked }))}
                  />
                  <label
                    htmlFor="use_custom_smtp"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Use custom email provider
                  </label>
                </div>

                {formData.use_custom_smtp && (
                  <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>SMTP Host *</Label>
                        <Input
                          value={formData.smtp_host}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_host: e.target.value }))}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label>SMTP Port *</Label>
                        <Input
                          type="number"
                          value={formData.smtp_port}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>SMTP Username *</Label>
                      <Input
                        value={formData.smtp_username}
                        onChange={(e) => setFormData(prev => ({ ...prev, smtp_username: e.target.value }))}
                        placeholder="your-email@domain.com"
                      />
                    </div>

                    <div>
                      <Label>SMTP Password *</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.smtp_password}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_password: e.target.value }))}
                          placeholder="Your SMTP password"
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

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>From Email *</Label>
                        <Input
                          type="email"
                          value={formData.smtp_from_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_from_email: e.target.value }))}
                          placeholder="noreply@yourdomain.com"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Emails will appear from this address
                        </p>
                      </div>
                      <div>
                        <Label>From Name *</Label>
                        <Input
                          value={formData.smtp_from_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, smtp_from_name: e.target.value }))}
                          placeholder="Your Company Name"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          Display name for sender
                        </p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                      <strong>Note:</strong> Common SMTP providers:
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li><strong>Gmail:</strong> smtp.gmail.com:587 (use app password)</li>
                        <li><strong>Outlook:</strong> smtp.office365.com:587</li>
                        <li><strong>SendGrid:</strong> smtp.sendgrid.net:587</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
              >
                {updateSettingsMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Save White Label Settings
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Where is this used?</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Fault reporting forms when tenants report issues</li>
              <li>All pages visible to your tenants</li>
              <li>Email notifications sent to tenants (using your email provider if configured)</li>
              <li>Tenant dashboard header</li>
              <li>Fault update notifications to tenants</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WhiteLabelSettings() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <WhiteLabelSettingsContent />
    </ProtectedRoute>
  );
}