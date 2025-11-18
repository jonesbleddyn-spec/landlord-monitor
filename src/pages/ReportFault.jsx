import React, { useState, useEffect } from "react";
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
import { AlertCircle, Upload, Sparkles, Loader2, CheckCircle, Lightbulb, Home, Shield, Wrench, X } from "lucide-react";
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

  const isTenant = user?.user_type === 'tenant';

  // Fetch landlord details for white label branding
  const { data: landlordBranding } = useQuery({
    queryKey: ['landlord-branding', user?.landlord_id],
    queryFn: async () => {
      if (!user?.landlord_id) return null;
      const users = await base44.entities.User.list();
      return users.find(u => u.id === user.landlord_id);
    },
    enabled: !!user?.landlord_id && isTenant,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      
      if (isTenant) {
        if (user?.property_id) {
          return allProperties.filter(p => p.id === user.property_id);
        } else if (user?.landlord_id) {
          const landlordProps = allProperties.filter(p => p.landlord_id === user.landlord_id);
          return landlordProps.slice(0, 1);
        }
        return [];
      } else if (user?.user_type === 'landlord') {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (isTenant && properties.length === 1 && !formData.property_id) {
      setFormData(prev => ({ ...prev, property_id: properties[0].id }));
    }
  }, [isTenant, properties, formData.property_id]);

  const createFaultMutation = useMutation({
    mutationFn: async (faultData) => {
      const property = properties.find(p => p.id === faultData.property_id);
      
      const fault = await base44.entities.Fault.create({
        ...faultData,
        landlord_id: property?.landlord_id || user?.landlord_id || user?.id,
        status: "reported"
      });

      const suggestion = await base44.integrations.Core.InvokeLLM({
        prompt: `A fault has been reported: "${faultData.title}". 
        Description: ${faultData.description}
        Category: ${faultData.category}
        
        Provide:
        1. DIY Solution: A brief, practical temporary fix the tenant can safely try (2-3 sentences). Focus on simple steps.
        2. Prevention Tips: 2-3 tips to prevent this issue in the future (brief bullet points).
        
        Be helpful and practical. Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            diy_solution: { type: "string" },
            prevention_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return { fault, suggestion };
    },
    onSuccess: ({ suggestion }) => {
      setAiSuggestion(suggestion);
      queryClient.invalidateQueries({ queryKey: ['user-faults'] });
      
      setTimeout(() => {
        navigate(createPageUrl("Properties"));
      }, 10000);
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

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const analyzeWithAI = async () => {
    if (formData.images.length === 0) return;

    setAnalyzingImage(true);
    try {
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this image of a property maintenance issue. Provide:
        1. A brief title (under 10 words)
        2. A factual description of what you see - just describe the problem objectively (2-3 sentences)
        3. The category (one of: plumbing, electrical, heating, structural, appliances, security, pest_control, cleaning, other)
        4. Priority level (low, medium, high, or urgent)
        5. DIY Solution: A brief temporary fix (1-2 sentences)
        6. Prevention tips: 2-3 brief prevention tips
        
        Important: For the description, only describe the problem you see. Do not mention risks, dangers, or safety concerns.
        
        Format as JSON.`,
        file_urls: formData.images,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            category: { type: "string" },
            priority: { type: "string" },
            diy_solution: { type: "string" },
            prevention_tips: {
              type: "array",
              items: { type: "string" }
            }
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

      if (analysis.diy_solution || analysis.prevention_tips) {
        setAiSuggestion(analysis);
      }
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

  // Get branding colors
  const primaryColor = landlordBranding?.brand_color_primary || "#3B82F6"; // Default blue-500
  const secondaryColor = landlordBranding?.brand_color_secondary || "#8B5CF6"; // Default purple-500
  const companyName = landlordBranding?.company_name || "Property Management";
  const companyLogo = landlordBranding?.company_logo;

  if (createFaultMutation.isSuccess && aiSuggestion) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-none shadow-2xl">
            <CardHeader 
              className="text-white"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Fault Reported Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {aiSuggestion.diy_solution && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <AlertDescription className="text-blue-900">
                    <p className="font-semibold mb-2">💡 DIY Solution (Temporary Fix):</p>
                    <p>{aiSuggestion.diy_solution}</p>
                  </AlertDescription>
                </Alert>
              )}

              {aiSuggestion.prevention_tips && aiSuggestion.prevention_tips.length > 0 && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <AlertDescription className="text-purple-900">
                    <p className="font-semibold mb-2">🛡️ Prevention Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {aiSuggestion.prevention_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

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
                className="w-full text-white"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
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
        {/* White Label Header for Tenants */}
        {isTenant && (landlordBranding || user?.landlord_id) && (
          <div 
            className="rounded-xl p-6 mb-8 text-white shadow-xl"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          >
            <div className="flex items-center gap-4">
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-12 bg-white p-2 rounded"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{companyName}</h2>
                <p className="text-sm opacity-90">Property Management Services</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Report a Fault</h1>
          <p className="text-lg text-gray-600">
            Let us know about any maintenance issues that need attention
          </p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader 
            className="text-white"
            style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
          >
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Fault Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isTenant ? (
                <div>
                  <Label>Property</Label>
                  <div 
                    className="mt-2 p-4 rounded-lg border-2"
                    style={{ 
                      backgroundColor: `${primaryColor}10`,
                      borderColor: `${primaryColor}40`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Home className="w-5 h-5" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {properties[0]?.name || "Your Property"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {properties[0]?.address || "Loading..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
              )}

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
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt={`Fault ${idx + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <Button
                        type="button"
                        onClick={analyzeWithAI}
                        disabled={analyzingImage}
                        className="w-full text-white"
                        style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                      >
                        {analyzingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze with AI & Get Tips
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {aiSuggestion && !createFaultMutation.isSuccess && (
                <div className="space-y-3">
                  {aiSuggestion.diy_solution && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <AlertDescription className="text-blue-900 text-sm">
                        <p className="font-semibold mb-1">Quick DIY Tip:</p>
                        <p>{aiSuggestion.diy_solution}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {aiSuggestion.prevention_tips && aiSuggestion.prevention_tips.length > 0 && (
                    <Alert className="bg-purple-50 border-purple-200">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <AlertDescription className="text-purple-900 text-sm">
                        <p className="font-semibold mb-1">Prevention Tips:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {aiSuggestion.prevention_tips.slice(0, 2).map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

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
                className="w-full text-white text-lg py-6"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
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