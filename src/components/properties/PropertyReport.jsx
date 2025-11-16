import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, User, FileText, Download } from "lucide-react";
import { format } from "date-fns";

export default function PropertyReport({ property, faults, open, onClose }) {
  const openFaults = faults.filter(f => !['completed', 'closed'].includes(f.status));

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-blue-100 text-blue-800",
      acknowledged: "bg-purple-100 text-purple-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      contractor_assigned: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create CSV content
    const headers = ["Fault ID", "Title", "Description", "Category", "Priority", "Status", "Location", "Unit", "Reported By", "Reported Date", "Contractor", "Estimated Completion"];
    const rows = openFaults.map(fault => [
      fault.id,
      fault.title,
      fault.description || "",
      fault.category,
      fault.priority,
      fault.status.replace(/_/g, ' '),
      fault.location || "",
      fault.unit_number || "",
      fault.created_by || "",
      format(new Date(fault.created_date), "yyyy-MM-dd"),
      fault.contractor_name || "",
      fault.estimated_completion || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${property.name.replace(/\s+/g, '_')}_open_faults_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-blue-600" />
            Property Fault Report - {property.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Header */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Property Name</p>
                  <p className="font-semibold text-gray-900">{property.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-900 text-sm">{property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Report Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Faults</p>
                  <p className="font-semibold text-gray-900 text-xl">{openFaults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 print:hidden">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {/* Faults List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Open Faults Details</h3>
            
            {openFaults.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Open Faults</h3>
                  <p className="text-gray-600">This property has no open faults at this time.</p>
                </CardContent>
              </Card>
            ) : (
              openFaults.map((fault) => (
                <Card key={fault.id} className="border-l-4 border-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{fault.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getPriorityColor(fault.priority)}>
                            {fault.priority}
                          </Badge>
                          <Badge className={getStatusColor(fault.status)}>
                            {fault.status.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline">{fault.category}</Badge>
                        </div>
                      </div>
                    </div>

                    {fault.description && (
                      <p className="text-sm text-gray-600 mb-3">{fault.description}</p>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        {fault.location && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Location:</span>
                            <span className="text-gray-900 font-medium">{fault.location}</span>
                          </div>
                        )}
                        {fault.unit_number && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Unit:</span>
                            <span className="text-gray-900 font-medium">{fault.unit_number}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-500 min-w-[100px]">Reported By:</span>
                          <span className="text-gray-900 font-medium">{fault.created_by || "Unknown"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-500 min-w-[100px]">Reported:</span>
                          <span className="text-gray-900 font-medium">
                            {format(new Date(fault.created_date), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {fault.contractor_name && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Contractor:</span>
                            <span className="text-gray-900 font-medium">{fault.contractor_name}</span>
                          </div>
                        )}
                        {fault.estimated_completion && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Est. Completion:</span>
                            <span className="text-gray-900 font-medium">
                              {format(new Date(fault.estimated_completion), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        {fault.notes && (
                          <div className="flex items-start gap-2">
                            <span className="text-gray-500 min-w-[100px]">Notes:</span>
                            <span className="text-gray-900">{fault.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Summary Stats */}
          {openFaults.length > 0 && (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Summary by Priority</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {openFaults.filter(f => f.priority === 'urgent').length}
                    </p>
                    <p className="text-sm text-gray-600">Urgent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {openFaults.filter(f => f.priority === 'high').length}
                    </p>
                    <p className="text-sm text-gray-600">High</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {openFaults.filter(f => f.priority === 'medium').length}
                    </p>
                    <p className="text-sm text-gray-600">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {openFaults.filter(f => f.priority === 'low').length}
                    </p>
                    <p className="text-sm text-gray-600">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}