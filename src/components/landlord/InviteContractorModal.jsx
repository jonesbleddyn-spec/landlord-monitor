import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Loader2, CheckCircle, Copy } from "lucide-react";

export default function InviteContractorModal({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    property_id: "",
    contractor_email: "",
    contractor_name: ""
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

  const inviteContractorMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('inviteContractor', data),
    onSuccess: (response) => {
      setInvitationCode(response.data.invitation_code);
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await inviteContractorMutation.mutateAsync(formData);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
  };

  const handleClose = () => {
    setFormData({ property_id: "", contractor_email: "", contractor_name: "" });
    setInvitationCode("");
    inviteContractorMutation.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            Invite Contractor
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
              <p className="text-xs text-gray-500 mt-1">
                Contractor will be assigned to this property. You can assign them to more properties later.
              </p>
            </div>

            <div>
              <Label htmlFor="contractor_email">Contractor Email *</Label>
              <Input
                id="contractor_email"
                type="email"
                value={formData.contractor_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contractor_email: e.target.value }))}
                placeholder="contractor@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="contractor_name">Contractor Name</Label>
              <Input
                id="contractor_name"
                value={formData.contractor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contractor_name: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            {inviteContractorMutation.isError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {inviteContractorMutation.error?.response?.data?.error || 'Failed to send invitation'}
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
                disabled={inviteContractorMutation.isPending || !formData.property_id || !formData.contractor_email}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {inviteContractorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
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
                Contractor invitation sent successfully!
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
                The invitation has been sent to <strong>{formData.contractor_email}</strong>
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                The contractor will be able to view and update fault statuses for this property. They can only message you directly.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}