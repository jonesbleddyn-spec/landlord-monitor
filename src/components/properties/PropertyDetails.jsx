import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Users, 
  Mail, 
  Copy, 
  ExternalLink,
  CheckCircle,
  QrCode,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function PropertyDetails({ property, open, onClose, faults = [] }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!property) return null;

  const reportUrl = `${window.location.origin}${window.location.pathname}?page=PublicReportFault&property_code=${property.property_code}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(reportUrl)}`;

  const stats = {
    total: faults.length,
    open: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
    urgent: faults.filter(f => f.priority === 'urgent').length,
    completed: faults.filter(f => f.status === 'completed').length
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6 text-purple-600" />
            {property.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Property Image */}
          {property.image_url && (
            <div className="relative h-64 rounded-xl overflow-hidden">
              <img
                src={property.image_url}
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Property Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-lg">Property Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{property.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium text-gray-900 capitalize">{property.type || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Units</p>
                    <p className="font-medium text-gray-900">{property.units || 0}</p>
                  </div>
                </div>

                {property.manager_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Property Manager</p>
                      <p className="font-medium text-gray-900">{property.manager_email}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Code & QR */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Access Code & QR
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Property Code */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Property Code</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-2xl font-bold text-center text-purple-600 tracking-wider">
                      {property.property_code}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(property.property_code, 'code')}
                      className="flex-shrink-0"
                    >
                      {copiedCode ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">QR Code for Fault Reporting</p>
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 flex justify-center">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code for fault reporting"
                      className="w-[180px] h-[180px]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Tenants can scan this QR code to report faults
                  </p>
                </div>

                {/* Report URL */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(reportUrl, 'url')}
                      className="flex-1"
                    >
                      {copiedUrl ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Report Link
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(reportUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fault Statistics */}
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
              <CardTitle className="text-lg">Maintenance Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Faults</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                  <p className="text-sm text-gray-600">Open</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}