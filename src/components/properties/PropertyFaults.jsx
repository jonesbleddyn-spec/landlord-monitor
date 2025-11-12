import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wrench, 
  Zap, 
  Flame, 
  Home, 
  Settings, 
  Shield, 
  Bug, 
  Sparkles,
  MapPin,
  Calendar,
  User,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";

export default function PropertyFaults({ property, faults, onClose }) {
  const queryClient = useQueryClient();
  const [editingFault, setEditingFault] = useState(null);
  const [editData, setEditData] = useState({});

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isLandlord = user?.user_type === 'landlord';

  const statusStyles = {
    reported: "bg-yellow-100 text-yellow-800",
    acknowledged: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    contractor_assigned: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800"
  };

  const priorityStyles = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  const categoryIcons = {
    plumbing: Wrench,
    electrical: Zap,
    heating: Flame,
    structural: Home,
    appliances: Settings,
    security: Shield,
    pest_control: Bug,
    cleaning: Sparkles,
    other: Settings
  };

  const updateFaultMutation = useMutation({
    mutationFn: async ({ faultId, data }) => {
      await base44.entities.Fault.update(faultId, data);
      // Send notification email
      await base44.functions.invoke('notifyFaultUpdate', {
        fault_id: faultId,
        notification_type: data.status === 'completed' ? 'completed' : 
                          data.contractor_name ? 'contractor_assigned' : 'status_update'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-faults'] });
      queryClient.invalidateQueries({ queryKey: ['user-faults'] });
      setEditingFault(null);
      setEditData({});
    },
  });

  const deleteFaultMutation = useMutation({
    mutationFn: (faultId) => base44.entities.Fault.delete(faultId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-faults'] });
      queryClient.invalidateQueries({ queryKey: ['user-faults'] });
    },
  });

  const handleEdit = (fault) => {
    setEditingFault(fault.id);
    setEditData({
      status: fault.status,
      priority: fault.priority,
      contractor_name: fault.contractor_name || "",
      estimated_completion: fault.estimated_completion || "",
      notes: fault.notes || ""
    });
  };

  const handleSave = async (faultId) => {
    await updateFaultMutation.mutateAsync({ faultId, data: editData });
  };

  const handleDelete = async (faultId) => {
    if (window.confirm("Are you sure you want to delete this fault? This action cannot be undone.")) {
      await deleteFaultMutation.mutateAsync(faultId);
    }
  };

  const handleMarkCompleted = async (fault) => {
    await updateFaultMutation.mutateAsync({
      faultId: fault.id,
      data: {
        status: "completed",
        completed_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Home className="w-6 h-6" />
            {property.name} - Fault History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {faults.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No faults reported for this property yet.</p>
            </div>
          ) : (
            faults.map((fault) => {
              const CategoryIcon = categoryIcons[fault.category] || Settings;
              const isEditing = editingFault === fault.id;

              return (
                <Card key={fault.id} className="border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <CategoryIcon className="w-5 h-5 text-blue-600" />
                          {fault.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {isEditing ? (
                            <>
                              <Select
                                value={editData.status}
                                onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="reported">Reported</SelectItem>
                                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="contractor_assigned">Contractor Assigned</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>

                              <Select
                                value={editData.priority}
                                onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                            </>
                          ) : (
                            <>
                              <Badge className={statusStyles[fault.status]}>
                                {fault.status.replace(/_/g, ' ')}
                              </Badge>
                              <Badge className={priorityStyles[fault.priority]}>
                                {fault.priority} priority
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isLandlord && (
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSave(fault.id)}
                                disabled={updateFaultMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingFault(null);
                                  setEditData({});
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(fault)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              {fault.status !== "completed" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkCompleted(fault)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(fault.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{fault.description}</p>

                    {isEditing && (
                      <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <Label>Contractor Name</Label>
                          <Input
                            value={editData.contractor_name}
                            onChange={(e) => setEditData(prev => ({ ...prev, contractor_name: e.target.value }))}
                            placeholder="Assigned contractor"
                          />
                        </div>
                        <div>
                          <Label>Estimated Completion Date</Label>
                          <Input
                            type="date"
                            value={editData.estimated_completion}
                            onChange={(e) => setEditData(prev => ({ ...prev, estimated_completion: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Input
                            value={editData.notes}
                            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                    )}

                    {fault.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{fault.location}</span>
                        {fault.unit_number && <span>• Unit {fault.unit_number}</span>}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Reported: {new Date(fault.created_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{fault.created_by}</span>
                      </div>
                    </div>

                    {fault.contractor_name && !isEditing && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>Contractor:</strong> {fault.contractor_name}
                        </p>
                        {fault.estimated_completion && (
                          <p className="text-sm text-blue-900">
                            <strong>Est. Completion:</strong> {new Date(fault.estimated_completion).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {fault.notes && !isEditing && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Notes:</strong> {fault.notes}
                        </p>
                      </div>
                    )}

                    {fault.completed_date && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-900">
                          <strong>✓ Completed:</strong> {new Date(fault.completed_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {fault.images && fault.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {fault.images.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Fault ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                            onClick={() => window.open(url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}