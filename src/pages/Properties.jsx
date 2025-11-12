import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, AlertCircle, CheckCircle, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PropertyFaults from "../components/properties/PropertyFaults";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function PropertiesContent() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isLandlord = user?.user_type === 'landlord';
  const isAdmin = user?.role === 'admin';

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      } else if (user?.landlord_id) {
        return allProperties.filter(p => p.landlord_id === user.landlord_id);
      }
      return allProperties; // Admin sees all
    },
    enabled: !!user,
  });

  const { data: allFaults = [] } = useQuery({
    queryKey: ['user-faults'],
    queryFn: async () => {
      const faults = await base44.entities.Fault.list('-created_date');
      if (isLandlord) {
        return faults.filter(f => f.landlord_id === user.id);
      } else if (user?.landlord_id) {
        return faults.filter(f => f.landlord_id === user.landlord_id);
      }
      return faults; // Admin sees all
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Properties</h1>
            <p className="text-lg text-gray-600">
              {isLandlord ? 'Manage your properties and track maintenance' : 
               isAdmin ? 'View all properties in the system' : 
               'View your property information'}
            </p>
          </div>
          <Link to={createPageUrl("ReportFault")}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              Report Fault
            </Button>
          </Link>
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
                <Card key={property.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none">
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

                    <Button
                      onClick={() => setSelectedProperty(property)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      View Faults
                    </Button>
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
              <p className="text-gray-600">Properties will appear here once added to the system.</p>
            </CardContent>
          </Card>
        )}

        {selectedProperty && (
          <PropertyFaults
            property={selectedProperty}
            faults={allFaults.filter(f => f.property_id === selectedProperty.id)}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </div>
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