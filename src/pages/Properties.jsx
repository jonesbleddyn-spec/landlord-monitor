import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyFaults from "../components/properties/PropertyFaults";
import PropertyDetails from "../components/properties/PropertyDetails";
import PropertyReport from "../components/properties/PropertyReport";
import PropertyCard from "../components/properties/PropertyCard";
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
  const navigate = useNavigate();
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
  const isTenant = user?.user_type === 'tenant';
  const isContractor = user?.user_type === 'contractor';

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['user-properties', user?.id, user?.user_type, user?.property_ids],
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
      } else if (isContractor) {
        if (user?.property_ids?.length > 0) {
          return allProperties.filter(p => user.property_ids.includes(p.id));
        }
        return [];
      }
      return [];
    },
    enabled: !!user && !!user.user_type,
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
      } else if (isContractor) {
        if (user?.property_ids?.length > 0) {
          return faults.filter(f => user.property_ids.includes(f.property_id));
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

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
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
    e.target.value = '';
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

  // Contractor view - can view faults and update status
  if (isContractor && properties.length > 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Assigned Properties</h1>
              <p className="text-lg text-gray-600">View faults and update status for your assigned properties</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const stats = getPropertyStats(property.id);
              return (
                <PropertyCard
                  key={property.id}
                  property={property}
                  stats={stats}
                  onClick={() => setSelectedPropertyForDetails(property)}
                  onViewFaults={() => setSelectedPropertyForFaults(property)}
                  onViewReport={() => setSelectedPropertyForReport(property)}
                  showEdit={false}
                  showCompliance={false}
                />
              );
            })}
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
              canEditStatus={true}
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
      </div>
    );
  }

  // Tenant view - simplified
  if (isTenant && properties.length > 0) {
    const property = properties[0];
    const stats = getPropertyStats(property.id);
    const showCompliance = property.show_compliance_to_tenants !== false;

    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Property</h1>
              <p className="text-lg text-gray-600">View your property details and report faults</p>
            </div>
            <Link to={createPageUrl("ReportFault")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                Report Fault
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            <PropertyCard
              property={property}
              stats={stats}
              onClick={() => setSelectedPropertyForDetails(property)}
              onViewFaults={() => setSelectedPropertyForFaults(property)}
              onViewReport={() => setSelectedPropertyForReport(property)}
              showEdit={false}
              showCompliance={showCompliance}
            />
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

          {selectedPropertyForReport && (
            <PropertyReport
              property={selectedPropertyForReport}
              faults={allFaults.filter(f => f.property_id === selectedPropertyForReport.id)}
              open={!!selectedPropertyForReport}
              onClose={() => setSelectedPropertyForReport(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // Landlord view
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
                    <label className="cursor-pointer">
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
                <div className="h-48 bg-gray-200" />
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
                <PropertyCard
                  key={property.id}
                  property={property}
                  stats={stats}
                  onClick={() => setSelectedPropertyForDetails(property)}
                  onEdit={() => navigate(`${createPageUrl("EditProperty")}?property_id=${property.id}`)}
                  onViewFaults={() => setSelectedPropertyForFaults(property)}
                  onViewReport={() => setSelectedPropertyForReport(property)}
                  onDelete={isLandlord ? () => handleDeleteClick(property) : null}
                  showEdit={isLandlord}
                  showCompliance={true}
                />
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