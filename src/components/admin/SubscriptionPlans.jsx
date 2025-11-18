import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, X, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SubscriptionPlans() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const emptyPlan = {
    name: "",
    price: 0,
    currency: "GBP",
    interval: "month",
    features: [],
    max_properties: 10,
    storage_mb: 500,
    is_popular: false,
    is_active: true,
    stripe_price_id: "",
    sort_order: 0
  };

  const [formData, setFormData] = useState(emptyPlan);
  const [featureInput, setFeatureInput] = useState("");

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.SubscriptionPlan.list();
      return allPlans.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success("Plan created successfully");
      setIsCreating(false);
      setFormData(emptyPlan);
    },
    onError: () => toast.error("Failed to create plan")
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success("Plan updated successfully");
      setEditingPlan(null);
    },
    onError: () => toast.error("Failed to update plan")
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success("Plan deleted successfully");
      setDeletingPlan(null);
    },
    onError: () => toast.error("Failed to delete plan")
  });

  const handleEdit = (plan) => {
    setEditingPlan(plan.id);
    setFormData({
      name: plan.name,
      price: plan.price,
      currency: plan.currency || "GBP",
      interval: plan.interval || "month",
      features: plan.features || [],
      max_properties: plan.max_properties,
      storage_mb: plan.storage_mb,
      is_popular: plan.is_popular || false,
      is_active: plan.is_active !== false,
      stripe_price_id: plan.stripe_price_id || "",
      sort_order: plan.sort_order || 0
    });
  };

  const handleSave = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan, data: formData });
    } else if (isCreating) {
      createPlanMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setFormData(emptyPlan);
    setFeatureInput("");
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const isEditing = editingPlan || isCreating;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-gray-600">Manage pricing tiers and features</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle>{isCreating ? "Create New Plan" : "Edit Plan"}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Plan Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Professional"
                />
              </div>
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="29.99"
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  placeholder="GBP"
                />
              </div>
              <div>
                <Label>Billing Interval *</Label>
                <Select
                  value={formData.interval}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Properties *</Label>
                <Input
                  type="number"
                  value={formData.max_properties}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_properties: parseInt(e.target.value) }))}
                  placeholder="-1 for unlimited"
                />
                <p className="text-xs text-gray-500 mt-1">Use -1 for unlimited</p>
              </div>
              <div>
                <Label>Storage (MB) *</Label>
                <Input
                  type="number"
                  value={formData.storage_mb}
                  onChange={(e) => setFormData(prev => ({ ...prev, storage_mb: parseInt(e.target.value) }))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Stripe Price ID</Label>
                <Input
                  value={formData.stripe_price_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, stripe_price_id: e.target.value }))}
                  placeholder="price_xxxxx"
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add a feature..."
                />
                <Button type="button" onClick={addFeature} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1">{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
              />
              <Label>Mark as Popular</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active (available for users)</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!formData.name || formData.price < 0}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? "opacity-50" : ""}>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.is_popular && (
                    <Crown className="w-5 h-5 text-yellow-300" />
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {plan.currency} {plan.price}
                  <span className="text-sm font-normal">/{plan.interval}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="text-sm text-gray-600">
                    <strong>Properties:</strong> {plan.max_properties === -1 ? 'Unlimited' : plan.max_properties}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Storage:</strong> {plan.storage_mb}MB
                  </div>
                  {plan.stripe_price_id && (
                    <div className="text-xs text-gray-500">
                      Stripe: {plan.stripe_price_id}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <strong className="text-sm">Features:</strong>
                  <ul className="mt-2 space-y-1">
                    {plan.features?.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {feature}</li>
                    ))}
                    {plan.features?.length > 3 && (
                      <li className="text-sm text-gray-500">+ {plan.features.length - 3} more</li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(plan)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeletingPlan(plan)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingPlan} onOpenChange={() => setDeletingPlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPlan?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePlanMutation.mutate(deletingPlan.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}