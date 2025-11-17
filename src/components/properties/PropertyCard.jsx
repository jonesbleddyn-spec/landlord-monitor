import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Eye, 
  Trash2, 
  FileText,
  Shield,
  Edit
} from "lucide-react";
import { format, differenceInMonths, isPast } from "date-fns";

export default function PropertyCard({ 
  property, 
  stats, 
  onClick, 
  onEdit,
  onViewFaults, 
  onViewReport, 
  onDelete,
  showEdit = false,
  showCompliance = true
}) {
  
  const getCertificateStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    
    if (isPast(expiry)) {
      return { status: 'expired', color: 'bg-red-100 text-red-700 border-red-300', icon: '🔴' };
    }
    
    const monthsUntilExpiry = differenceInMonths(expiry, now);
    
    if (monthsUntilExpiry <= 3) {
      return { status: 'due-soon', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '🟡' };
    }
    
    return { status: 'valid', color: 'bg-green-100 text-green-700 border-green-300', icon: '🟢' };
  };

  const certificates = [
    { name: 'Gas', date: property.gas_certificate_expiry },
    { name: 'Elec', date: property.electrical_certificate_expiry },
    { name: 'EPC', date: property.epc_expiry }
  ];

  const getPriorityColor = (count) => {
    if (count === 0) return "bg-green-100 text-green-800";
    if (count <= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none cursor-pointer"
      onClick={onClick}
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

        {showCompliance && certificates.some(c => c.date) && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Compliance</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {certificates.map((cert) => {
                if (!cert.date) return null;
                const status = getCertificateStatus(cert.date);
                return (
                  <Badge 
                    key={cert.name} 
                    variant="outline" 
                    className={`text-xs ${status.color} border`}
                  >
                    {status.icon} {cert.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewFaults();
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            View Faults
          </Button>
          {showEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Edit Property"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onViewReport();
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Generate Report"
          >
            <FileText className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}