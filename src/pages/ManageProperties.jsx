
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, AlertCircle, CheckCircle, Plus, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyFaults from "../components/properties/PropertyFaults";
import PropertyCodeCard from "../components/properties/PropertyCodeCard";

export default function ManageProperties() {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showCodeCard, setShowCodeCard] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      return allProperties.filter(p => p.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const { data: allFaults = [] } = useQuery({
    queryKey: ['landlord-faults'],
    queryFn: async () => {
      const faults = await base44.entities.Fault.list('-created_date');
      return faults.filter(f => f.landlord_id === user.id);
    },
    enabled: !!user,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("LandlordDashboard"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Properties</h1>
              <p className="text-lg text-gray-600 mt-2">Manage your property portfolio</p>
            </div>
            <Link to={createPageUrl("AddProperty")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </Link>
          </div>
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
        ) : properties.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first property to the platform.</p>
              <Link to={createPageUrl("AddProperty")}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const stats = getPropertyStats(property.id);
              return (
                <Card key={property.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image_url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80"}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className={getPriorityColor(stats.urgent)}>
                        {stats.urgent} Urgent
                      </Badge>
                      <Badge className="bg-purple-600 text-white font-mono">
                        {property.property_code}
                      </Badge>
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
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Units</p>
                        <p className="text-lg font-semibold">{property.units || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Open Faults</p>
                        <p className="text-lg font-semibold">{stats.open}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {stats.total} Total
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        {stats.completed} Done
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setSelectedProperty(property)}
                        variant="outline"
                        className="w-full"
                      >
                        View Faults
                      </Button>
                      <Button
                        onClick={() => setShowCodeCard(property)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        Get Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedProperty && (
          <PropertyFaults
            property={selectedProperty}
            faults={allFaults.filter(f => f.property_id === selectedProperty.id)}
            onClose={() => setSelectedProperty(null)}
          />
        )}

        {showCodeCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowCodeCard(null)}>
            <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <PropertyCodeCard property={showCodeCard} />
              <Button
                onClick={() => setShowCodeCard(null)}
                className="w-full mt-4 bg-white hover:bg-gray-100 text-gray-900"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
