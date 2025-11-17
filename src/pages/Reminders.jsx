import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Trash2, CheckCircle, Calendar, Clock, X } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { format, differenceInDays, isPast } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function RemindersContent() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminder_date: "",
    category: "other",
    property_id: "",
    first_reminder_days: 7,
    second_reminder_days: 1
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      return allProperties.filter(p => p.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const allReminders = await base44.entities.Reminder.list('-reminder_date');
      return allReminders.filter(r => r.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const createReminderMutation = useMutation({
    mutationFn: (data) => base44.entities.Reminder.create({
      ...data,
      landlord_id: user.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success("Reminder created successfully");
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        reminder_date: "",
        category: "other",
        property_id: "",
        first_reminder_days: 7,
        second_reminder_days: 1
      });
    },
  });

  const toggleCompletedMutation = useMutation({
    mutationFn: ({ id, completed }) => base44.entities.Reminder.update(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success("Reminder updated");
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => base44.entities.Reminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success("Reminder deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createReminderMutation.mutate(formData);
  };

  const getReminderStatus = (reminder) => {
    if (reminder.completed) return { label: "Completed", color: "bg-green-100 text-green-800" };
    
    const daysUntil = differenceInDays(new Date(reminder.reminder_date), new Date());
    
    if (isPast(new Date(reminder.reminder_date)) && !reminder.completed) {
      return { label: "Overdue", color: "bg-red-100 text-red-800" };
    }
    if (daysUntil <= reminder.second_reminder_days) {
      return { label: `${daysUntil} days left`, color: "bg-red-100 text-red-800" };
    }
    if (daysUntil <= reminder.first_reminder_days) {
      return { label: `${daysUntil} days left`, color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: `${daysUntil} days left`, color: "bg-blue-100 text-blue-800" };
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const categories = [
    { value: "maintenance", label: "Maintenance" },
    { value: "inspection", label: "Inspection" },
    { value: "certificate", label: "Certificate Renewal" },
    { value: "insurance", label: "Insurance" },
    { value: "payment", label: "Payment" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Reminders</h1>
            <p className="text-lg text-gray-600">Manage your property reminders and never miss important dates</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Renew gas certificate"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Property (Optional)</Label>
                    <Select
                      value={formData.property_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        {properties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Reminder Date *</Label>
                  <Input
                    type="date"
                    value={formData.reminder_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Email Reminder Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-900">First Reminder (days before)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.first_reminder_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_reminder_days: parseInt(e.target.value) }))}
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700 mt-1">First email reminder</p>
                    </div>
                    <div>
                      <Label className="text-blue-900">Second Reminder (days before)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.second_reminder_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, second_reminder_days: parseInt(e.target.value) }))}
                        className="bg-white"
                      />
                      <p className="text-xs text-blue-700 mt-1">Final email reminder</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createReminderMutation.isPending}>
                    Create Reminder
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Reminders</p>
                  <p className="text-3xl font-bold text-gray-900">{activeReminders.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600">
                    {activeReminders.filter(r => isPast(new Date(r.reminder_date))).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedReminders.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Reminders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            {activeReminders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No active reminders. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeReminders.map(reminder => {
                  const status = getReminderStatus(reminder);
                  const property = properties.find(p => p.id === reminder.property_id);
                  return (
                    <div key={reminder.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{reminder.title}</h4>
                          <Badge variant="outline">{reminder.category.replace(/_/g, ' ')}</Badge>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(reminder.reminder_date), 'MMM dd, yyyy')}
                          </span>
                          {property && (
                            <span>{property.name}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            {reminder.first_reminder_days}d & {reminder.second_reminder_days}d before
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleCompletedMutation.mutate({ id: reminder.id, completed: true })}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReminderMutation.mutate(reminder.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedReminders.slice(0, 10).map(reminder => {
                  const property = properties.find(p => p.id === reminder.property_id);
                  return (
                    <div key={reminder.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg opacity-70">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900 line-through">{reminder.title}</h4>
                          <Badge variant="outline">{reminder.category.replace(/_/g, ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{format(new Date(reminder.reminder_date), 'MMM dd, yyyy')}</span>
                          {property && <span>{property.name}</span>}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReminderMutation.mutate(reminder.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Reminders() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <RemindersContent />
    </ProtectedRoute>
  );
}