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

  // Use backend function to get people (needs service role to list users)
  const { data: peopleData = { tenants: [], contractors: [], pendingInvitations: [] }, isLoading: loadingPeople } = useQuery({
    queryKey: ['landlord-people', user?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLandlordPeople');
      return response.data;
    },
    enabled: !!user,
  });

  const tenants = peopleData.tenants || [];
  const contractors = peopleData.contractors || [];
  const pendingInvitations = peopleData.pendingInvitations || [];
  const loadingUsers = loadingPeople;
  const loadingInvitations = loadingPeople;

  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId) => base44.entities.Invitation.delete(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-people'] });
      toast.success("Invitation cancelled");
      setDeleteDialogOpen(false);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (person) => {
      await base44.functions.invoke('removeUserFromProperty', {
        visitorId: person.id,
        userType: person.user_type,
        propertyId: person.property_id,
        invitationId: person.invitation_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord-people'] });
      toast.success("User removed from this property");
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to remove user: " + error.message);
    }
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
      removeUserMutation.mutate(itemToDelete);
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

        <Tabs defaultValue="byProperty" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="byProperty">By Property</TabsTrigger>
            <TabsTrigger value="tenants">Tenants ({tenants.length})</TabsTrigger>
            <TabsTrigger value="contractors">Contractors ({contractors.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingInvitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="byProperty">
            {loadingPeople ? (
              <Card className="p-8 text-center text-gray-500">Loading...</Card>
            ) : properties.length === 0 ? (
              <Card className="p-8 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No properties yet.</p>
              </Card>
            ) : (
              <div className="space-y-6">
                {properties.map(property => {
                  const propertyTenants = tenants.filter(t => t.property_id === property.id);
                  const propertyContractors = contractors.filter(c => c.property_id === property.id);
                  const propertyPending = pendingInvitations.filter(i => i.property_id === property.id);
                  const totalPeople = propertyTenants.length + propertyContractors.length + propertyPending.length;

                  return (
                    <Card key={property.id}>
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                        <CardTitle className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          {property.name}
                          <Badge variant="outline" className="ml-2">{totalPeople} people</Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-500">{property.address}</p>
                      </CardHeader>
                      <CardContent className="p-4">
                        {totalPeople === 0 ? (
                          <p className="text-gray-500 text-center py-4">No tenants or contractors assigned</p>
                        ) : (
                          <div className="space-y-3">
                            {propertyTenants.map(tenant => (
                              <div key={`${tenant.id}-${property.id}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Users className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{tenant.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{tenant.email}</p>
                                  </div>
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">Tenant</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(tenant, 'user')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {propertyContractors.map(contractor => (
                              <div key={`${contractor.id}-${property.id}-${contractor.invitation_id}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Wrench className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{contractor.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">{contractor.email}</p>
                                  </div>
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">Contractor</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(contractor, 'user')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {propertyPending.map(invitation => (
                              <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-yellow-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{invitation.invitee_name || invitation.invitee_email}</p>
                                    <p className="text-xs text-gray-500">{invitation.invitee_email}</p>
                                  </div>
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending {invitation.invitee_type}</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(invitation, 'invitation')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

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
                  <Card key={`${tenant.id}-${tenant.property_id}`}>
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
                            <span className="text-xs text-gray-500">{tenant.property_name || getPropertyName(tenant.property_id)}</span>
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
                  <Card key={`${contractor.id}-${contractor.property_id}-${contractor.invitation_id}`}>
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
                            <span className="text-xs text-gray-500">{contractor.property_name}</span>
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
                        Remove from property
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