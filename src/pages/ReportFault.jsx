
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Upload, Sparkles, Loader2, CheckCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function ReportFaultContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (user?.user_type === 'tenant' && user?.landlord_id) {
        return allProperties.filter(p => p.landlord_id === user.landlord_id);
      } else if (user?.user_type === 'landlord') {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  const createFaultMutation = useMutation({
    mutationFn: async (faultData) => {
      const property = properties.find(p => p.id === faultData.property_id);
      
      // Create the fault
      const fault = await base44.entities.Fault.create({
        ...faultData,
        landlord_id: property?.landlord_id || user?.landlord_id || user?.id,
        status: "reported"
      });

      // Get AI suggestion for quick fix
      const suggestion = await base44.integrations.Core.InvokeLLM({
        prompt: `A fault has been reported: "${faultData.title}". 
        Description: ${faultData.description}
        Category: ${faultData.category}
        
        Provide a brief, practical suggestion (2-3 sentences) for a quick temporary fix the tenant can try while waiting for professional repair. Be helpful and safety-conscious.`,
      });

      return { fault, suggestion };
    },
    onSuccess: ({ suggestion }) => {
      setAiSuggestion(suggestion);
      queryClient.invalidateQueries({ queryKey: ['user-faults'] });
      
      // Navigate after showing suggestion
      setTimeout(() => {
        navigate(createPageUrl("Properties"));
      }, 8000);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createFaultMutation.mutateAsync(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newImageUrls] 
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
    }
    setUploadingImage(false);
  };

  const analyzeWithAI = async () => {
    if (formData.images.length === 0) return;

    setAnalyzingImage(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image of a property maintenance issue. Provide:
        1. A brief title (under 10 words)
        2. A detailed description (2-3 sentences)
        3. The category (one of: plumbing, electrical, heating, structural, appliances, security, pest_control, cleaning, other)
        4. Priority level (low, medium, high, or urgent)
        
        Format as JSON.`,
        file_urls: formData.images,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            priority: { type: "string" }
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        title: analysis.title || prev.title,
        description: analysis.description || prev.description,
        category: analysis.category || prev.category,
        priority: analysis.priority || prev.priority
      }));
    } catch (error) {
      console.error("AI analysis error:", error);
    }
    setAnalyzingImage(false);
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

  if (createFaultMutation.isSuccess && aiSuggestion) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Fault Reported Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <Alert className="bg-blue-50 border-blue-200">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="font-semibold mb-2">Quick Fix Suggestion:</p>
                  <p>{aiSuggestion}</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  ✅ Your fault report has been submitted and the landlord has been notified via email.
                </p>
                <p>
                  📧 You'll receive email updates as the status changes.
                </p>
                <p className="text-sm text-gray-600">
                  Redirecting to properties page...
                </p>
              </div>

              <Button
                onClick={() => navigate(createPageUrl("Properties"))}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                View Properties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Report a Fault</h1>
          <p className="text-lg text-gray-600">
            Let us know about any maintenance issues that need attention
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Fault Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => handleInputChange('property_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload with AI Analysis */}
              <div>
                <Label>Upload Images</Label>
                <div className="mt-2 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-gray-600">
                      {uploadingImage ? "Uploading..." : "Click to upload images"}
                    </span>
                  </label>

                  {formData.images.length > 0 && (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        {formData.images.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Fault ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                      
                      <Button
                        type="button"
                        onClick={analyzeWithAI}
                        disabled={analyzingImage}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {analyzingImage ? (
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
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label>Fault Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <Label>Detailed Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide more details about the fault..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Kitchen, Bathroom"
                  />
                </div>

                <div>
                  <Label>Unit Number</Label>
                  <Input
                    value={formData.unit_number}
                    onChange={(e) => handleInputChange('unit_number', e.target.value)}
                    placeholder="e.g., Apt 101"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createFaultMutation.isPending || !formData.property_id || !formData.title || !formData.description || !formData.category}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
              >
                {createFaultMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2" />
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

export default function ReportFault() {
  return (
    <ProtectedRoute>
      <ReportFaultContent />
    </ProtectedRoute>
  );
}
