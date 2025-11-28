import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, CheckCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function RedeemInvitationCard({ userType = "tenant" }) {
  const [invitationCode, setInvitationCode] = useState("");
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const redeemMutation = useMutation({
    mutationFn: (code) => base44.functions.invoke('redeemInvitation', { invitation_code: code }),
    onSuccess: (response) => {
      setSuccess(true);
      setInvitationCode("");
      toast.success(`Successfully joined ${response.data.property?.name || 'property'}!`);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Invalid invitation code');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      toast.error("Please enter an invitation code");
      return;
    }
    redeemMutation.mutate(invitationCode.trim());
  };

  const isContractor = userType === "contractor";

  return (
    <Card className={`border-2 border-dashed ${isContractor ? 'border-orange-300 hover:border-orange-500' : 'border-purple-300 hover:border-purple-500'} transition-all`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isContractor ? 'bg-orange-100' : 'bg-purple-100'}`}>
            <KeyRound className={`w-4 h-4 ${isContractor ? 'text-orange-600' : 'text-purple-600'}`} />
          </div>
          {isContractor ? "Join New Property" : "Accept Invitation"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex items-center gap-2 text-green-600 py-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Property added successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-gray-600">
              {isContractor 
                ? "Enter a code from your landlord to join a new property"
                : "Have an invitation code? Enter it below to join a property"
              }
            </p>
            <div className="flex gap-2">
              <Input
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code"
                maxLength={8}
                className="font-mono tracking-wider"
                disabled={redeemMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={redeemMutation.isPending || !invitationCode.trim()}
                className={isContractor 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "bg-purple-600 hover:bg-purple-700"
                }
              >
                {redeemMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}