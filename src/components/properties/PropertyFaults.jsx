import React from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, AlertCircle, CheckCircle, Clock, Image as ImageIcon } from "lucide-react";

export default function PropertyFaults({ property, faults, onClose }) {
  const statusColors = {
    reported: "bg-yellow-100 text-yellow-800 border-yellow-200",
    acknowledged: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-purple-100 text-purple-800 border-purple-200",
    contractor_assigned: "bg-indigo-100 text-indigo-800 border-indigo-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    closed: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  const categoryIcons = {
    plumbing: "💧",
    electrical: "⚡",
    heating: "🔥",
    structural: "🏗️",
    appliances: "🔌",
    security: "🔒",
    pest_control: "🐛",
    cleaning: "🧹",
    other: "🔧"
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {property.name} - Faults History
          </DialogTitle>
          <p className="text-gray-600">{property.address}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {faults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
                <p className="text-gray-600">No faults reported for this property.</p>
              </CardContent>
            </Card>
          ) : (
            faults.map((fault) => (
              <Card key={fault.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{categoryIcons[fault.category] || "🔧"}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{fault.title}</h3>
                        <p className="text-gray-600 text-sm">{fault.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={`${statusColors[fault.status]} border`}>
                        {fault.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className={priorityColors[fault.priority]}>
                        {fault.priority}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    {fault.unit_number && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Unit {fault.unit_number}</span>
                      </div>
                    )}
                    {fault.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{fault.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(fault.created_date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{fault.created_by}</span>
                    </div>
                  </div>

                  {fault.contractor_name && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Contractor:</span> {fault.contractor_name}
                      </p>
                      {fault.estimated_completion && (
                        <p className="text-sm text-blue-900 mt-1">
                          <span className="font-semibold">Est. Completion:</span>{" "}
                          {format(new Date(fault.estimated_completion), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  )}

                  {fault.images && fault.images.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-600">Attached Images</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {fault.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Fault ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {fault.notes && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{fault.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}