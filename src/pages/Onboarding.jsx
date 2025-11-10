import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle, Loader2 } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_type: "landlord",
    company_name: "",
    phone: ""
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        base44.auth.redirectToLogin(createPageUrl("Onboarding"));
        return null;
      }
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      if (formData.user_type === 'landlord') {
        navigate(createPageUrl("LandlordDashboard"));
      } else {
        navigate(createPageUrl("Properties"));
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    await updateUserMutation.mutateAsync({
      ...formData,
      landlord_id: formData.user_type === 'landlord' ? user.id : null,
      subscription_plan: "free",
      subscription_status: "trial",
      trial_end_date: trialEndDate.toISOString().split('T')[0],
      onboarding_completed: true
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user?.onboarding_completed) {
    navigate(createPageUrl(user.user_type === 'landlord' ? "LandlordDashboard" : "Properties"));
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Landlord Monitor</h1>
          <p className="text-lg text-gray-600">Let's set up your account</p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl">Account Setup</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Type */}
              <div>
                <Label className="text-lg font-semibold mb-4 block">I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, user_type: "landlord" }))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.user_type === "landlord"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Building2 className={`w-8 h-8 mx-auto mb-2 ${
                      formData.user_type === "landlord" ? "text-purple-600" : "text-gray-400"
                    }`} />
                    <div className="font-semibold">Landlord</div>
                    <div className="text-sm text-gray-600">Manage properties</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, user_type: "tenant" }))}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      formData.user_type === "tenant"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${
                      formData.user_type === "tenant" ? "text-purple-600" : "text-gray-400"
                    }`} />
                    <div className="font-semibold">Tenant</div>
                    <div className="text-sm text-gray-600">Report issues</div>
                  </button>
                </div>
              </div>

              {/* Landlord-specific fields */}
              {formData.user_type === "landlord" && (
                <>
                  <div>
                    <Label htmlFor="company_name">Company/Business Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+44 20 1234 5678"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">30-Day Free Trial</h4>
                        <p className="text-sm text-blue-800">
                          Your trial starts today. No credit card required. Cancel anytime.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tenant-specific info */}
              {formData.user_type === "tenant" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-1">Almost There!</h4>
                      <p className="text-sm text-purple-800">
                        You'll need an invitation code from your landlord to access your property. 
                        Contact your property manager to get started.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={updateUserMutation.isPending || (formData.user_type === 'landlord' && !formData.company_name)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}