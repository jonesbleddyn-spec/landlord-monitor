import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Download, Loader2, Wrench, Shield, Building2 } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AllPropertiesReport({ properties, faults, open, onClose }) {
  const [loadingTips, setLoadingTips] = useState(false);
  const [faultTips, setFaultTips] = useState({});
  
  const openFaults = faults.filter(f => !['completed', 'closed'].includes(f.status));
  const urgentFaults = openFaults.filter(f => f.priority === 'urgent');
  const highFaults = openFaults.filter(f => f.priority === 'high');
  const mediumFaults = openFaults.filter(f => f.priority === 'medium');
  const lowFaults = openFaults.filter(f => f.priority === 'low');

  useEffect(() => {
    if (open && openFaults.length > 0) {
      generateTipsForFaults();
    }
  }, [open]);

  const generateTipsForFaults = async () => {
    setLoadingTips(true);
    const tips = {};
    
    for (const fault of openFaults.slice(0, 10)) {
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `For this maintenance issue: "${fault.title}" (Category: ${fault.category})
          ${fault.description ? `Description: ${fault.description}` : ''}
          
          Provide:
          1. DIY Solution: A brief temporary fix (1-2 sentences)
          2. Prevention: 2 brief prevention tips
          
          Format as JSON.`,
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
        tips[fault.id] = result;
      } catch (error) {
        console.error("Error generating tips for fault:", fault.id, error);
      }
    }
    
    setFaultTips(tips);
    setLoadingTips(false);
  };

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

  const handleDownload = () => {
    const headers = ["Property", "Fault ID", "Title", "Description", "Category", "Priority", "Status", "Location", "Unit", "Reported By", "Reported Date", "Contractor", "Estimated Completion", "DIY Solution", "Prevention Tips"];
    const rows = openFaults.map(fault => {
      const property = properties.find(p => p.id === fault.property_id);
      return [
        property?.name || "Unknown",
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
        fault.estimated_completion || "",
        faultTips[fault.id]?.diy_solution || "",
        faultTips[fault.id]?.prevention_tips?.join("; ") || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_properties_faults_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6 text-blue-600" />
            All Properties Fault Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Report Date</p>
                  <p className="text-lg font-semibold text-gray-900">{format(new Date(), "MMM d, yyyy")}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Open Faults</p>
                  <p className="text-2xl font-bold text-gray-900">{openFaults.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{urgentFaults.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{highFaults.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 print:hidden">
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download CSV Report
            </Button>
            <Button onClick={() => window.print()} variant="outline" className="flex-1">
              <Building2 className="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>

          {loadingTips && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-900">
                Generating DIY solutions and prevention tips for all faults...
              </AlertDescription>
            </Alert>
          )}

          {/* Grouped by Property */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Faults by Property</h3>
            
            {properties.map(property => {
              const propertyFaults = openFaults.filter(f => f.property_id === property.id);
              if (propertyFaults.length === 0) return null;

              return (
                <Card key={property.id} className="border-2 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{property.name}</h4>
                        <p className="text-sm text-gray-600">{property.address}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 text-lg px-3 py-1">
                        {propertyFaults.length} Open
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {propertyFaults.map((fault) => (
                        <Card key={fault.id} className="border-l-4 border-blue-500 bg-gray-50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{fault.title}</h5>
                                {fault.description && (
                                  <p className="text-sm text-gray-600 mt-1">{fault.description}</p>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 items-end ml-4">
                                <Badge className={getPriorityColor(fault.priority)}>
                                  {fault.priority}
                                </Badge>
                                <Badge className={getStatusColor(fault.status)}>
                                  {fault.status.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-600 mt-3">
                              {fault.location && <div><strong>Location:</strong> {fault.location}</div>}
                              {fault.unit_number && <div><strong>Unit:</strong> {fault.unit_number}</div>}
                              {fault.category && <div><strong>Category:</strong> {fault.category}</div>}
                              <div><strong>Reported:</strong> {format(new Date(fault.created_date), "MMM d, yyyy")}</div>
                              {fault.contractor_name && <div><strong>Contractor:</strong> {fault.contractor_name}</div>}
                              {fault.estimated_completion && (
                                <div><strong>Est. Completion:</strong> {format(new Date(fault.estimated_completion), "MMM d, yyyy")}</div>
                              )}
                            </div>

                            {faultTips[fault.id] && (
                              <div className="space-y-2 border-t pt-3 mt-3">
                                {faultTips[fault.id].diy_solution && (
                                  <Alert className="bg-blue-50 border-blue-200">
                                    <Wrench className="w-4 h-4 text-blue-600" />
                                    <AlertDescription className="text-blue-900 text-sm">
                                      <p className="font-semibold mb-1">DIY Solution:</p>
                                      <p>{faultTips[fault.id].diy_solution}</p>
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {faultTips[fault.id].prevention_tips && faultTips[fault.id].prevention_tips.length > 0 && (
                                  <Alert className="bg-purple-50 border-purple-200">
                                    <Shield className="w-4 h-4 text-purple-600" />
                                    <AlertDescription className="text-purple-900 text-sm">
                                      <p className="font-semibold mb-1">Prevention Tips:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {faultTips[fault.id].prevention_tips.map((tip, idx) => (
                                          <li key={idx}>{tip}</li>
                                        ))}
                                      </ul>
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Summary by Priority</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{urgentFaults.length}</p>
                  <p className="text-sm text-gray-600">Urgent</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">{highFaults.length}</p>
                  <p className="text-sm text-gray-600">High</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{mediumFaults.length}</p>
                  <p className="text-sm text-gray-600">Medium</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{lowFaults.length}</p>
                  <p className="text-sm text-gray-600">Low</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}