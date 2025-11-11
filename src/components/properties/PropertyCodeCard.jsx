import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function PropertyCodeCard({ property }) {
  const [copied, setCopied] = useState(false);
  
  const reportUrl = `${window.location.origin}${createPageUrl("PublicReportFault")}?code=${property.property_code}`;
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(property.property_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reportUrl)}`;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <QrCode className="w-5 h-5" />
          Property Access Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Code Display */}
        <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
          <p className="text-sm text-gray-600 mb-2">Property Code</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-mono tracking-widest text-purple-900">
              {property.property_code}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="border-purple-300 hover:bg-purple-100"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share this code with tenants to report faults without logging in
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">Scan to Report Fault</p>
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-2">
            Tenants can scan this QR code to access the fault report form
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            className="w-full justify-start border-purple-300 hover:bg-purple-100"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            Copy Report Link
          </Button>
          
          <Button
            onClick={() => window.open(reportUrl, '_blank')}
            variant="outline"
            className="w-full justify-start border-purple-300 hover:bg-purple-100"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Report Form
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> Print the QR code and place it in common areas so tenants can quickly report issues!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}