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
import { Switch } from "@/components/ui/switch";
import { Building2, Upload, Loader2, ArrowLeft, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function EditPropertyContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('property_id');
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "apartment",
    units: 1,
    manager_email: "",
    image_url: "",
    gas_certificate_expiry: "",
    electrical_certificate_expiry: "",
    epc_expiry: "",
    show_compliance_to_tenants: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const properties = await base44.entities.Property.list();
      return properties.find(p => p.id === propertyId);
    },
    enabled: !!propertyId,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        address: property.address || "",
        type: property.type || "apartment",
        units: property.units || 1,
        manager_email: property.manager_email || "",
        image_url: property.image_url || "",
        gas_certificate_expiry: property.gas_certificate_expiry || "",
        electrical_certificate_expiry: property.electrical_certificate_expiry || "",
        epc_expiry: property.epc_expiry || "",
        show_compliance_to_tenants: property.show_compliance_to_tenants !== false
      });
    }
  }, [property]);

  const updatePropertyMutation = useMutation({
    mutationFn: (propertyData) => base44.entities.Property.update(propertyId, propertyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
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
    await updatePropertyMutation.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Property Not Found</h2>
            <Link to={createPageUrl("Properties")}>
              <Button>Back to Properties</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Properties")}>
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-lg text-gray-600">Update property information</p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
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

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    {formData.show_compliance_to_tenants ? (
                      <Eye className="w-5 h-5 text-blue-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <Label className="text-sm font-semibold text-gray-900">
                        Show Compliance Dates to Tenants
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Allow tenants to view certificate expiry dates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.show_compliance_to_tenants}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_compliance_to_tenants: checked }))}
                  />
                </div>
              </div>

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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Properties"))}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePropertyMutation.isPending || uploadingImage || !formData.name || !formData.address}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {updatePropertyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Update Property
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditProperty() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <EditPropertyContent />
    </ProtectedRoute>
  );
}