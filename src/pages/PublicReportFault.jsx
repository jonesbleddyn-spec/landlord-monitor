import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Camera, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

export default function PublicReportFault() {
  const [formData, setFormData] = useState({
    property_code: "",
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
    unit_number: "",
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const submitFaultMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('submitPublicFault', data),
    onSuccess: () => {
      setSuccessMessage("Fault reported successfully! The property owner has been notified.");
      setFormData({
        property_code: "",
        reporter_name: "",
        reporter_email: "",
        reporter_phone: "",
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location: "",
        unit_number: "",
        images: []
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    setUploadingImages(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitFaultMutation.mutateAsync(formData);
  };

  const categories = [
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "heating", label: "Heating/Cooling" },
    { value: "structural", label: "Structural" },
    { value: "appliances", label: "Appliances" },
    { value: "security", label: "Security" },
    { value: "pest_control", label: "Pest Control" },
    { value: "cleaning", label: "Cleaning" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Report a Property Issue</h1>
          <p className="text-lg text-gray-600">
            No login required - just enter your property code and describe the issue
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {submitFaultMutation.isError && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitFaultMutation.error?.response?.data?.error || 'Failed to submit fault. Please check your property code and try again.'}
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl">Fault Report Form</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <Label htmlFor="property_code" className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Property Code *
                </Label>
                <Input
                  id="property_code"
                  value={formData.property_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, property_code: e.target.value.toUpperCase() }))}
                  placeholder="Enter 5-character code"
                  maxLength={5}
                  className="font-mono text-xl tracking-widest text-center"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  This code was provided by your landlord (e.g., ABC12)
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-gray-900">Your Contact Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reporter_name">Your Name *</Label>
                    <Input
                      id="reporter_name"
                      value={formData.reporter_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporter_name: e.target.value }))}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reporter_email">Email *</Label>
                    <Input
                      id="reporter_email"
                      type="email"
                      value={formData.reporter_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, reporter_email: e.target.value }))}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reporter_phone">Phone Number</Label>
                  <Input
                    id="reporter_phone"
                    type="tel"
                    value={formData.reporter_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, reporter_phone: e.target.value }))}
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description (e.g., Leaking pipe in bathroom)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide as much detail as possible about the issue..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">How Urgent?</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">Medium - Soon</SelectItem>
                      <SelectItem value="high">High - This week</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location in Property</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Kitchen, Bathroom"
                  />
                </div>

                <div>
                  <Label htmlFor="unit_number">Unit/Apartment Number</Label>
                  <Input
                    id="unit_number"
                    value={formData.unit_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                    placeholder="e.g., Apt 4B"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Upload Photos (Optional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload photos of the issue</p>
                    <p className="text-xs text-gray-500 mt-1">Photos help us understand the problem better</p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images.map((url, index) => (
                      <img key={index} src={url} alt={`Upload ${index + 1}`} className="rounded-lg h-24 w-full object-cover" />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  submitFaultMutation.isPending || 
                  uploadingImages ||
                  !formData.property_code || 
                  !formData.reporter_name || 
                  !formData.reporter_email ||
                  !formData.title ||
                  !formData.description ||
                  !formData.category
                }
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {submitFaultMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Fault Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need your property code? Contact your landlord or property manager.</p>
          <p className="mt-2">Your report will be sent directly to the property owner.</p>
        </div>
      </div>
    </div>
  );
}