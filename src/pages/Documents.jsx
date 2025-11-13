import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Calendar, ExternalLink, AlertCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function DocumentsContent() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [newDocument, setNewDocument] = useState({
    property_id: "",
    title: "",
    document_type: "",
    unit_number: "",
    expiry_date: "",
    notes: ""
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isTenant = user?.user_type === 'tenant';
  const isLandlord = user?.user_type === 'landlord';

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isTenant && user?.property_id) {
        // Tenant sees ONLY their assigned property
        return allProperties.filter(p => p.id === user.property_id);
      } else if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['user-documents'],
    queryFn: async () => {
      const allDocuments = await base44.entities.Document.list('-created_date');
      if (isTenant && user?.property_id) {
        // Tenant sees only documents for their property
        return allDocuments.filter(d => d.property_id === user.property_id);
      } else if (isLandlord) {
        return allDocuments.filter(d => d.landlord_id === user.id);
      }
      return [];
    },
    enabled: !!user,
  });

  const createDocumentMutation = useMutation({
    mutationFn: (docData) => {
      const propertyData = properties.find(p => p.id === docData.property_id);
      return base44.entities.Document.create({
        ...docData,
        landlord_id: propertyData?.landlord_id || user?.landlord_id || user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      setNewDocument({
        property_id: "",
        title: "",
        document_type: "",
        unit_number: "",
        expiry_date: "",
        notes: ""
      });
      toast.success("Document uploaded successfully!");
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId) => base44.entities.Document.delete(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-documents'] });
      toast.success("Document deleted successfully");
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete document");
      console.error(error);
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await createDocumentMutation.mutateAsync({
        ...newDocument,
        file_url
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload document");
    }
    setUploading(false);
  };

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };

  const documentTypes = [
    { value: "contract", label: "Contract", icon: "📄" },
    { value: "lease", label: "Lease Agreement", icon: "📝" },
    { value: "insurance", label: "Insurance", icon: "🛡️" },
    { value: "inspection", label: "Inspection Report", icon: "🔍" },
    { value: "maintenance", label: "Maintenance Record", icon: "🔧" },
    { value: "certificate", label: "Certificate", icon: "🏆" },
    { value: "other", label: "Other", icon: "📋" }
  ];

  const getDocTypeIcon = (type) => {
    return documentTypes.find(t => t.value === type)?.icon || "📋";
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.floor((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isTenant ? "Property Documents" : "Document Repository"}
          </h1>
          <p className="text-lg text-gray-600">
            {isTenant 
              ? "View important documents for your property"
              : "Store and manage all your property-related documents securely"}
          </p>
        </div>

        <div className={`grid ${isTenant ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 mb-8`}>
          {/* Upload Form - Hidden for tenants */}
          {!isTenant && (
            <Card className="shadow-xl border-none">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label>Property *</Label>
                    <Select
                      value={newDocument.property_id}
                      onValueChange={(value) => setNewDocument(prev => ({ ...prev, property_id: value }))}
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

                  <div>
                    <Label>Document Title *</Label>
                    <Input
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Lease Agreement 2025"
                    />
                  </div>

                  <div>
                    <Label>Document Type *</Label>
                    <Select
                      value={newDocument.document_type}
                      onValueChange={(value) => setNewDocument(prev => ({ ...prev, document_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Unit Number</Label>
                    <Input
                      value={newDocument.unit_number}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, unit_number: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={newDocument.expiry_date}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={newDocument.notes}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes"
                    />
                  </div>

                  <div>
                    <Label>Upload File *</Label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={!newDocument.property_id || !newDocument.title || !newDocument.document_type || uploading}
                      className="w-full mt-2 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-600 file:to-emerald-600 file:text-white hover:file:opacity-90 file:cursor-pointer"
                    />
                  </div>

                  {uploading && (
                    <div className="text-center text-sm text-gray-600">
                      Uploading document...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents List */}
          <div className={isTenant ? 'col-span-1' : 'lg:col-span-2'}>
            <div className="space-y-4">
              {documents.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                    <p className="text-gray-600">
                      {isTenant 
                        ? "No documents have been uploaded for your property yet."
                        : "Upload your first document to get started."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                documents.map((doc) => {
                  const property = properties.find(p => p.id === doc.property_id);
                  const expiringSoon = isExpiringSoon(doc.expiry_date);
                  const expired = isExpired(doc.expiry_date);

                  return (
                    <Card key={doc.id} className="hover:shadow-lg transition-shadow border-none">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-4xl">{getDocTypeIcon(doc.document_type)}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{doc.title}</h3>
                              {!isTenant && (
                                <p className="text-sm text-gray-600 mb-3">{property?.name || "Unknown Property"}</p>
                              )}

                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="outline">
                                  {doc.document_type.replace(/_/g, ' ')}
                                </Badge>
                                {doc.unit_number && (
                                  <Badge variant="outline">Unit {doc.unit_number}</Badge>
                                )}
                                {doc.expiry_date && (
                                  <Badge className={
                                    expired ? "bg-red-100 text-red-800" :
                                    expiringSoon ? "bg-yellow-100 text-yellow-800" :
                                    "bg-green-100 text-green-800"
                                  }>
                                    {expired && <AlertCircle className="w-3 h-3 mr-1" />}
                                    {expired ? "Expired" : expiringSoon ? "Expiring Soon" : "Valid"}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Uploaded: {format(new Date(doc.created_date), "MMM d, yyyy")}
                                </div>
                                {doc.expiry_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Expires: {format(new Date(doc.expiry_date), "MMM d, yyyy")}
                                  </div>
                                )}
                              </div>

                              {doc.notes && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">{doc.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            
                            {isLandlord && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(doc)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Documents() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}