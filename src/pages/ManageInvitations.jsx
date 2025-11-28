import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Wrench, Home, Trash2, Mail, Calendar, Building2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
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
import ProtectedRoute from "../components/auth/ProtectedRoute";

function ManageInvitationsContent() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['landlord-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      return allProperties.filter(p => p.landlord_id === user?.id);
    },
    enabled: !!user,
  });

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery({
    queryKey: ['landlord-invitations', user?.id],
    queryFn: async () => {
      const allInvitations = await base44.entities.Invitation.list('-created_date');
      return allInvitations.filter(i => i.landlord_id === user?.id);
    },
    enabled: !!user,
  });

  // Get users from accepted invitations by this landlord
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['landlord-users', user?.id],
    queryFn: async () => {
      // Get accepted invitations from this landlord
      const allInvitations = await base44.entities.Invitation.list();
      const acceptedInvitations = allInvitations.filter(
        i => i.landlord_id === user?.id && i.status === 'accepted' && i.used_by
      );
      
      if (acceptedInvitations.length === 0) {
        return [];
      }
      
      // Get all users
      const users = await base44.entities.User.list();
      
      // Map invitation data to users
      const linkedUsers = acceptedInvitations.map(inv => {
        const linkedUser = users.find(u => u.id === inv.used_by);
        if (linkedUser) {
          return {
            ...linkedUser,
            // Add invitation data for display
            invitation_property_id: inv.property_id,
            invitation_type: inv.invitee_type || 'tenant'
          };
        }
        return null;
      }).filter(Boolean);
      
      return linkedUsers;
    },
    enabled: !!user,
  });

  const tenants = allUsers.filter(u => u.user_type === 'tenant' || u.invitation_type === 'tenant');
  const contractors = allUsers.filter(u => u.user_type === 'contractor' || u.invitation_type === 'contractor');
  const pendingInvitations = invitations.filter(i => i.status === 'pending');

  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId) => base44.entities.Invitation.delete(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-invitations'] });
      toast.success("Invitation cancelled");
      setDeleteDialogOpen(false);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId) => {
      const userToRemove = allUsers.find(u => u.id === userId);
      if (userToRemove?.user_type === 'contractor') {
        // Remove this landlord's properties from contractor's property_ids
        const updatedPropertyIds = (userToRemove.property_ids || []).filter(
          pid => !properties.some(p => p.id === pid)
        );
        await base44.entities.User.update(userId, {
          property_ids: updatedPropertyIds,
          landlord_id: updatedPropertyIds.length > 0 ? userToRemove.landlord_id : null
        });
      } else {
        // For tenants, clear their property association
        await base44.entities.User.update(userId, {
          property_id: null,
          landlord_id: null
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-users'] });
      toast.success("User removed from your properties");
      setDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'invitation') {
      deleteInvitationMutation.mutate(itemToDelete.id);
    } else {
      removeUserMutation.mutate(itemToDelete.id);
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const getPropertyNames = (propertyIds) => {
    if (!propertyIds || propertyIds.length === 0) return 'No properties';
    return propertyIds
      .map(pid => properties.find(p => p.id === pid)?.name)
      .filter(Boolean)
      .join(', ') || 'Unknown';
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Manage People</h1>
          <p className="text-lg text-gray-600">View and manage tenants and contractors for your properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.length}</p>
                  <p className="text-sm text-gray-600">Active Tenants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{contractors.length}</p>
                  <p className="text-sm text-gray-600">Active Contractors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingInvitations.length}</p>
                  <p className="text-sm text-gray-600">Pending Invitations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tenants">Tenants ({tenants.length})</TabsTrigger>
            <TabsTrigger value="contractors">Contractors ({contractors.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingInvitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            {loadingUsers ? (
              <Card className="p-8 text-center text-gray-500">Loading...</Card>
            ) : tenants.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tenants yet. Invite tenants from your dashboard.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {tenants.map(tenant => (
                  <Card key={tenant.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{tenant.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{tenant.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{getPropertyName(tenant.property_id)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(tenant, 'user')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contractors">
            {loadingUsers ? (
              <Card className="p-8 text-center text-gray-500">Loading...</Card>
            ) : contractors.length === 0 ? (
              <Card className="p-8 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contractors yet. Invite contractors from your dashboard.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {contractors.map(contractor => (
                  <Card key={contractor.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{contractor.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{contractor.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{getPropertyNames(contractor.property_ids)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(contractor, 'user')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {loadingInvitations ? (
              <Card className="p-8 text-center text-gray-500">Loading...</Card>
            ) : pendingInvitations.length === 0 ? (
              <Card className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending invitations.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map(invitation => (
                  <Card key={invitation.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          invitation.invitee_type === 'contractor' ? 'bg-orange-100' : 'bg-purple-100'
                        }`}>
                          {invitation.invitee_type === 'contractor' ? (
                            <Wrench className="w-5 h-5 text-orange-600" />
                          ) : (
                            <Users className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{invitation.invitee_name || invitation.invitee_email}</p>
                            <Badge variant="outline" className="text-xs">
                              {invitation.invitee_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{invitation.invitee_email}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {getPropertyName(invitation.property_id)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires: {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(invitation, 'invitation')}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteType === 'invitation' ? 'Cancel Invitation' : 'Remove User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'invitation'
                ? 'Are you sure you want to cancel this invitation? The person will no longer be able to use this code.'
                : 'Are you sure you want to remove this user from your properties? They will lose access immediately.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteType === 'invitation' ? 'Cancel Invitation' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ManageInvitations() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <ManageInvitationsContent />
    </ProtectedRoute>
  );
}