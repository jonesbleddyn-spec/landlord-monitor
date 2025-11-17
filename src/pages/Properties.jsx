
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, AlertCircle, CheckCircle, Clock, Users, Eye, Mail, QrCode, Home, Trash2, FileText, Plus, Upload, Download, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyFaults from "../components/properties/PropertyFaults";
import PropertyDetails from "../components/properties/PropertyDetails";
import PropertyReport from "../components/properties/PropertyReport";
import ProtectedRoute from "../components/auth/ProtectedRoute";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function PropertiesContent() {
  const [selectedPropertyForFaults, setSelectedPropertyForFaults] = useState(null);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState(null);
  const [selectedPropertyForReport, setSelectedPropertyForReport] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isLandlord = user?.user_type === 'landlord';
  const isAdmin = user?.role === 'admin';
  const isTenant = user?.user_type === 'tenant';

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      
      if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      } else if (isTenant) {
        if (user?.property_id) {
          return allProperties.filter(p => p.id === user.property_id);
        } else if (user?.landlord_id) {
          const landlordProps = allProperties.filter(p => p.landlord_id === user.landlord_id);
          return landlordProps.slice(0, 1);
        }
        return [];
      }
      return allProperties;
    },
    enabled: !!user,
  });

  const { data: allFaults = [] } = useQuery({
    queryKey: ['user-faults'],
    queryFn: async () => {
      const faults = await base44.entities.Fault.list('-created_date');
      
      if (isLandlord) {
        return faults.filter(f => f.landlord_id === user.id);
      } else if (isTenant) {
        if (properties.length > 0) {
          return faults.filter(f => f.property_id === properties[0].id);
        }
        return [];
      }
      return faults;
    },
    enabled: !!user && properties.length > 0,
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId) => base44.entities.Property.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      queryClient.invalidateQueries({ queryKey: ['user-faults'] });
      toast.success("Property deleted successfully");
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete property");
    }
  });

  const handleDeleteClick = (e, property) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleReportClick = (e, property) => {
    e.stopPropagation();
    setSelectedPropertyForReport(property);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      deletePropertyMutation.mutate(propertyToDelete.id);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ["name", "address", "type", "units", "manager_email", "image_url"],
      ["Sample Building", "123 Main St, City, State, ZIP", "apartment", "10", "manager@example.com", "https://example.com/image.jpg"],
      ["Another Property", "456 Oak Ave, City, State, ZIP", "house", "1", "contact@example.com", ""]
    ];

    const csvContent = template.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success("Template downloaded");
  };

  const exportProperties = () => {
    if (properties.length === 0) {
      toast.error("No properties to export");
      return;
    }

    const headers = ["name", "address", "type", "units", "manager_email", "property_code"];
    const rows = properties.map(p => [
      p.name,
      p.address,
      p.type || "",
      p.units || "",
      p.manager_email || "",
      p.property_code || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `properties_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success(`Exported ${properties.length} properties`);
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCSV(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.functions.invoke('bulkImportProperties', {
        csv_file_url: file_url
      });

      if (result.data.status === 'success') {
        toast.success(`Successfully imported ${result.data.imported_count} properties`);
        queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      } else {
        toast.error(result.data.message || "Failed to import properties");
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast.error("Failed to upload CSV file");
    }
    setUploadingCSV(false);
    e.target.value = ''; // Clear the input so same file can be selected again
  };

  const getPropertyStats = (propertyId) => {
    const propertyFaults = allFaults.filter(f => f.property_id === propertyId);
    return {
      total: propertyFaults.length,
      open: propertyFaults.filter(f => !['completed', 'closed'].includes(f.status)).length,
      urgent: propertyFaults.filter(f => f.priority === 'urgent').length,
      completed: propertyFaults.filter(f => f.status === 'completed').length
    };
  };

  const getPriorityColor = (count) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      contractor_assigned: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  // Tenant-specific single property view
  if (isTenant && properties.length > 0) {
    const property = properties[0];
    const stats = getPropertyStats(property.id);
    const propertyFaults = allFaults.filter(f => f.property_id === property.id);

    const faultsByStatus = {
      urgent: propertyFaults.filter(f => f.priority === 'urgent' && !['completed', 'closed'].includes(f.status)),
      open: propertyFaults.filter(f => f.priority !== 'urgent' && !['completed', 'closed'].includes(f.status)),
      completed: propertyFaults.filter(f => f.status === 'completed'),
      closed: propertyFaults.filter(f => f.status === 'closed')
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                My Property
              </h1>
              <p className="text-lg text-gray-600">View your property details and report faults</p>
            </div>
            <Link to={createPageUrl("ReportFault")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Fault
              </Button>
            </Link>
          </div>

          <Card className="border-none shadow-2xl mb-8 overflow-hidden">
            <div className="relative h-64">
              <img
                src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80"}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{property.name}</h2>
                <p className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  {property.address}
                </p>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-semibold text-gray-900 capitalize">{property.type || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Units</p>
                    <p className="font-semibold text-gray-900">{property.units || 0}</p>
                  </div>
                </div>

                {property.manager_email && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Manager</p>
                      <p className="font-semibold text-gray-900 text-sm">{property.manager_email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Faults</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{stats.open}</p>
                  <p className="text-sm text-gray-600">Open</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPropertyForDetails(property)}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
                <Button
                  onClick={() => setSelectedPropertyForFaults(property)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All Faults
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Reported Faults</h2>

            {faultsByStatus.urgent.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-600">Urgent ({faultsByStatus.urgent.length})</h3>
                </div>
                <div className="space-y-3">
                  {faultsByStatus.urgent.map((fault) => (
                    <Card key={fault.id} className="border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{fault.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{fault.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              Reported {format(new Date(fault.created_date), "MMM d, yyyy")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={getStatusColor(fault.status)}>
                              {fault.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(fault.priority)}>
                              {fault.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {faultsByStatus.open.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-600">Open ({faultsByStatus.open.length})</h3>
                </div>
                <div className="space-y-3">
                  {faultsByStatus.open.map((fault) => (
                    <Card key={fault.id} className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{fault.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{fault.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              Reported {format(new Date(fault.created_date), "MMM d, yyyy")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={getStatusColor(fault.status)}>
                              {fault.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(fault.priority)}>
                              {fault.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {faultsByStatus.completed.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-600">Completed ({faultsByStatus.completed.length})</h3>
                </div>
                <div className="space-y-3">
                  {faultsByStatus.completed.map((fault) => (
                    <Card key={fault.id} className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{fault.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{fault.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Reported {format(new Date(fault.created_date), "MMM d, yyyy")}
                              </div>
                              {fault.completed_date && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Completed {format(new Date(fault.completed_date), "MMM d, yyyy")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge className={getStatusColor(fault.status)}>
                              {fault.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(fault.priority)}>
                              {fault.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {propertyFaults.length === 0 && (
              <Card className="text-center py-12 border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Faults Reported</h3>
                  <p className="text-gray-600 mb-4">Your property is in great condition!</p>
                  <Link to={createPageUrl("ReportFault")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Report a Fault
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {selectedPropertyForDetails && (
            <PropertyDetails
              property={selectedPropertyForDetails}
              faults={allFaults.filter(f => f.property_id === selectedPropertyForDetails.id)}
              open={!!selectedPropertyForDetails}
              onClose={() => setSelectedPropertyForDetails(null)}
            />
          )}

          {selectedPropertyForFaults && (
            <PropertyFaults
              property={selectedPropertyForFaults}
              faults={allFaults.filter(f => f.property_id === selectedPropertyForFaults.id)}
              onClose={() => setSelectedPropertyForFaults(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Landlord/Admin multi-property view
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Properties</h1>
            <p className="text-lg text-gray-600">
              {isLandlord ? 'Manage your properties and track maintenance' : 'View all properties in the system'}
            </p>
          </div>
          {isLandlord && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportProperties} disabled={properties.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Properties ({properties.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <label className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingCSV ? "Uploading..." : "Upload CSV"}
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        disabled={uploadingCSV}
                        className="hidden"
                      />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={createPageUrl("AddProperty")}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </Link>
            </div>
          )}
        </div>

        {loadingProperties ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-48 bg-gray-200" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const stats = getPropertyStats(property.id);
              return (
                <Card 
                  key={property.id} 
                  className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none cursor-pointer"
                  onClick={() => setSelectedPropertyForDetails(property)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={getPriorityColor(stats.urgent)}>
                        {stats.urgent} Urgent
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <Building2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                      <span>{property.name}</span>
                    </CardTitle>
                    <p className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {property.address}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{property.units || 0} units</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{stats.open} open faults</span>
                      </div>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {stats.total} Total
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {stats.completed} Done
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPropertyForFaults(property);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        View Faults
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => handleReportClick(e, property)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Generate Report"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {isLandlord && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => handleDeleteClick(e, property)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {properties.length === 0 && !loadingProperties && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first property.</p>
              {isLandlord && (
                <div className="flex gap-3 justify-center">
                  <Link to={createPageUrl("AddProperty")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Get CSV Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedPropertyForDetails && (
          <PropertyDetails
            property={selectedPropertyForDetails}
            faults={allFaults.filter(f => f.property_id === selectedPropertyForDetails.id)}
            open={!!selectedPropertyForDetails}
            onClose={() => setSelectedPropertyForDetails(null)}
          />
        )}

        {selectedPropertyForFaults && (
          <PropertyFaults
            property={selectedPropertyForFaults}
            faults={allFaults.filter(f => f.property_id === selectedPropertyForFaults.id)}
            onClose={() => setSelectedPropertyForFaults(null)}
          />
        )}

        {selectedPropertyForReport && (
          <PropertyReport
            property={selectedPropertyForReport}
            faults={allFaults.filter(f => f.property_id === selectedPropertyForReport.id)}
            open={!!selectedPropertyForReport}
            onClose={() => setSelectedPropertyForReport(null)}
          />
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone and will delete all associated data including faults and messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Properties() {
  return (
    <ProtectedRoute>
      <PropertiesContent />
    </ProtectedRoute>
  );
}
