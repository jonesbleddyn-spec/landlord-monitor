
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, CheckCircle, AlertCircle, Loader2, Camera } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ReportFault() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    property_id: "",
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
    unit_number: "",
    images: []
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [analyzingWithAI, setAnalyzingWithAI] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      // If tenant, filter by their landlord_id; if landlord, show their properties
      if (user?.user_type === 'tenant' && user?.landlord_id) {
        return allProperties.filter(p => p.landlord_id === user.landlord_id);
      } else if (user?.user_type === 'landlord') {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return allProperties;
    },
    enabled: !!user,
  });

  const createFaultMutation = useMutation({
    mutationFn: (faultData) => {
      const propertyData = properties.find(p => p.id === faultData.property_id);
      return base44.entities.Fault.create({
        ...faultData,
        landlord_id: propertyData?.landlord_id || user?.landlord_id || user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faults'] });
      queryClient.invalidateQueries({ queryKey: ['landlord-faults'] });
      setSuccessMessage("Fault reported successfully!");
      setTimeout(() => {
        navigate(createPageUrl("Properties"));
      }, 2000);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

  const analyzeImageWithAI = async () => {
    if (formData.images.length === 0) return;

    setAnalyzingWithAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image of a property maintenance issue. Provide:
        1. A brief title (max 50 chars)
        2. A detailed description of the problem
        3. The category (one of: plumbing, electrical, heating, structural, appliances, security, pest_control, cleaning, other)
        4. Suggested priority (low, medium, high, or urgent)
        5. Any safety concerns`,
        file_urls: formData.images[0],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            priority: { type: "string" },
            safety_concerns: { type: "string" }
          }
        }
      });

      if (result) {
        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          description: result.description || prev.description,
          category: result.category || prev.category,
          priority: result.priority || prev.priority
        }));
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    }
    setAnalyzingWithAI(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createFaultMutation.mutateAsync(formData);
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Report a Fault</h1>
          <p className="text-lg text-gray-600">
            Use AI to analyze images and create detailed fault reports instantly
          </p>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl">Fault Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Selection */}
              <div>
                <Label htmlFor="property">Property *</Label>
                <Select value={formData.property_id} onValueChange={(value) => handleInputChange('property_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload with AI Analysis */}
              <div>
                <Label>Upload Photos</Label>
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
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((url, index) => (
                        <img key={index} src={url} alt={`Upload ${index + 1}`} className="rounded-lg h-24 w-full object-cover" />
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={analyzeImageWithAI}
                      disabled={analyzingWithAI}
                      className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {analyzingWithAI ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Fault Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide more details about the fault"
                  rows={4}
                />
              </div>

              {/* Category and Priority */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location and Unit */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Kitchen, Bathroom"
                  />
                </div>

                <div>
                  <Label htmlFor="unit_number">Unit Number</Label>
                  <Input
                    id="unit_number"
                    value={formData.unit_number}
                    onChange={(e) => handleInputChange('unit_number', e.target.value)}
                    placeholder="e.g., Apt 4B"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createFaultMutation.isPending || !formData.property_id || !formData.title || !formData.category}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {createFaultMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
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
      </div>
    </div>
  );
}
