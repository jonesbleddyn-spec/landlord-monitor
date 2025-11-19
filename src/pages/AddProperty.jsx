import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Upload, Loader2, ArrowLeft, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UpgradePrompt from "../components/subscription/UpgradePrompt";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function AddPropertyContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [canAddProperty, setCanAddProperty] = useState(true);
  const [limitMessage, setLimitMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "apartment",
    units: 1,
    manager_email: "",
    image_url: "",
    gas_certificate_expiry: "",
    electrical_certificate_expiry: "",
    epc_expiry: ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Check subscription limits
  useEffect(() => {
    const checkLimits = async () => {
      try {
        const { data } = await base44.functions.invoke('checkSubscriptionLimits', {
          check_type: 'properties'
        });
        setCanAddProperty(data.can_proceed);
        if (!data.can_proceed) {
          setLimitMessage(data.message);
        }
      } catch (error) {
        console.error('Error checking limits:', error);
        setCanAddProperty(true);
      }
    };

    if (user) {
      checkLimits();
    }
  }, [user]);

  // Generate unique property code
  const generatePropertyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createPropertyMutation = useMutation({
    mutationFn: (propertyData) => base44.entities.Property.create({
      ...propertyData,
      property_code: generatePropertyCode(),
      landlord_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      navigate(createPageUrl("Properties"));
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddProperty) return;
    await createPropertyMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-lg text-gray-600">Add a property to your portfolio</p>
        </div>

        {!canAddProperty && (
          <div className="mb-6">
            <UpgradePrompt message={limitMessage} feature="Adding more properties" />
          </div>
        )}

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Name */}
              <div>
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Riverside Apartments"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street, London, UK"
                  rows={3}
                  required
                />
              </div>

              {/* Type and Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type">Property Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment Building</SelectItem>
                      <SelectItem value="house">Single House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="units">Number of Units</Label>
                  <Input
                    id="units"
                    type="number"
                    min="1"
                    value={formData.units}
                    onChange={(e) => setFormData(prev => ({ ...prev, units: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              {/* Manager Email */}
              <div>
                <Label htmlFor="manager_email">Property Manager Email</Label>
                <Input
                  id="manager_email"
                  type="email"
                  value={formData.manager_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, manager_email: e.target.value }))}
                  placeholder="manager@example.com"
                />
              </div>

              {/* Compliance Section */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Certificates</h3>
                </div>
                
                <Alert className="mb-4 bg-orange-50 border-orange-200">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <AlertDescription className="text-orange-900 text-sm">
                    You'll receive email reminders 3 months before certificate expiry dates.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gas_certificate_expiry">Gas Safety Certificate</Label>
                    <Input
                      id="gas_certificate_expiry"
                      type="date"
                      value={formData.gas_certificate_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, gas_certificate_expiry: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="electrical_certificate_expiry">Electrical Certificate</Label>
                    <Input
                      id="electrical_certificate_expiry"
                      type="date"
                      value={formData.electrical_certificate_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, electrical_certificate_expiry: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="epc_expiry">EPC Certificate</Label>
                    <Input
                      id="epc_expiry"
                      type="date"
                      value={formData.epc_expiry}
                      onChange={(e) => setFormData(prev => ({ ...prev, epc_expiry: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Property Image</Label>
                <div className="mt-2">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Property"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                        className="absolute top-2 right-2"
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {uploadingImage ? "Uploading..." : "Click to upload property image"}
                        </p>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createPropertyMutation.isPending || uploadingImage || !formData.name || !formData.address || !canAddProperty}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {createPropertyMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Add Property
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

export default function AddProperty() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <AddPropertyContent />
    </ProtectedRoute>
  );
}