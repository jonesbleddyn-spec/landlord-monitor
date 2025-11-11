import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle, Copy } from "lucide-react";

export default function InviteTenantModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    property_id: "",
    tenant_email: "",
    tenant_name: ""
  });
  const [invitationCode, setInvitationCode] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      return allProperties.filter(p => p.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const inviteTenantMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('inviteTenant', data),
    onSuccess: (response) => {
      setInvitationCode(response.data.invitation_code);
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await inviteTenantMutation.mutateAsync(formData);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
  };

  const handleClose = () => {
    setFormData({ property_id: "", tenant_email: "", tenant_name: "" });
    setInvitationCode("");
    inviteTenantMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Invite Tenant
          </DialogTitle>
        </DialogHeader>

        {!invitationCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="property_id">Property *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tenant_email">Tenant Email *</Label>
              <Input
                id="tenant_email"
                type="email"
                value={formData.tenant_email}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_email: e.target.value }))}
                placeholder="tenant@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="tenant_name">Tenant Name</Label>
              <Input
                id="tenant_name"
                value={formData.tenant_name}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_name: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            {inviteTenantMutation.isError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {inviteTenantMutation.error?.response?.data?.error || 'Failed to send invitation'}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteTenantMutation.isPending || !formData.property_id || !formData.tenant_email}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {inviteTenantMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Invitation sent successfully!
              </AlertDescription>
            </Alert>

            <div>
              <Label>Invitation Code</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={invitationCode}
                  readOnly
                  className="font-mono text-lg tracking-wider text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                The invitation has been sent to <strong>{formData.tenant_email}</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                The invitation code is valid for 7 days. The tenant can use this code during their onboarding process.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}