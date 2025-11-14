import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Plus,
  FileText,
  MessageSquare,
  UserPlus,
  Shield,
  Home,
  Megaphone,
  Sparkles
} from "lucide-react";
import InviteTenantModal from "../components/landlord/InviteTenantModal";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function DashboardContent() {
  const [showInviteModal, setShowInviteModal] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const isLandlord = user?.user_type === 'landlord';
  const isAdmin = user?.role === 'admin';
  const isTenant = user?.user_type === 'tenant';

  const { data: properties = [] } = useQuery({
    queryKey: ['user-properties'],
    queryFn: async () => {
      const allProperties = await base44.entities.Property.list();
      if (isLandlord) {
        return allProperties.filter(p => p.landlord_id === user.id);
      } else if (isTenant && user?.property_id) {
        return allProperties.filter(p => p.id === user.property_id);
      }
      return allProperties; // Admin sees all
    },
    enabled: !!user,
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['user-faults'],
    queryFn: async () => {
      const allFaults = await base44.entities.Fault.list('-created_date');
      if (isLandlord) {
        return allFaults.filter(f => f.landlord_id === user.id);
      } else if (isTenant && user?.property_id) {
        return allFaults.filter(f => f.property_id === user.property_id);
      }
      return allFaults; // Admin sees all
    },
    enabled: !!user,
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['user-messages', user?.id, user?.property_id, user?.landlord_id],
    queryFn: async () => {
      const messages = await base44.entities.Message.list('-created_date');
      
      if (isTenant) {
        const tenantPropertyId = user?.property_id;
        const tenantLandlordId = user?.landlord_id;
        
        if (!tenantPropertyId) return [];
        
        // Tenant sees: their property messages + announcements for their landlord
        return messages.filter(m => 
          !m.is_admin_broadcast && (
            m.property_id === tenantPropertyId || 
            (m.message_type === 'announcement' && m.landlord_id === tenantLandlordId && m.all_properties)
          )
        );
      } else if (isLandlord) {
        // Landlord sees only their messages (excluding admin broadcasts)
        return messages.filter(m => m.landlord_id === user.id && !m.is_admin_broadcast);
      } else if (isAdmin) {
        // Admin sees all non-broadcast messages
        return messages.filter(m => !m.is_admin_broadcast);
      }
      return [];
    },
    enabled: !!user,
  });

  // Admin broadcasts count for landlords
  const { data: adminBroadcasts = [] } = useQuery({
    queryKey: ['admin-broadcasts'],
    queryFn: async () => {
      if (!isLandlord) return [];
      const allMessages = await base44.entities.Message.list('-created_date');
      return allMessages.filter(m => m.is_admin_broadcast === true);
    },
    enabled: isLandlord,
  });

  // Calculate "new" items (within last 24 hours)
  const isNew = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const now = new Date();
    const hoursDiff = (now - itemDate) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff >= 0;
  };

  const newMessagesCount = allMessages.filter(m => isNew(m.created_date)).length;
  const newFaultsCount = faults.filter(f => isNew(f.created_date)).length;
  const newPropertiesCount = properties.filter(p => isNew(p.created_date)).length;

  const stats = {
    totalProperties: properties.length,
    totalFaults: faults.length,
    openFaults: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
    urgentFaults: faults.filter(f => f.priority === 'urgent' && !['completed', 'closed'].includes(f.status)).length,
    completedFaults: faults.filter(f => f.status === 'completed').length,
    totalMessages: allMessages.length,
    adminBroadcasts: adminBroadcasts.length,
    newMessages: newMessagesCount,
    newFaults: newFaultsCount,
    newProperties: newPropertiesCount
  };

  const recentFaults = faults.slice(0, 5);

  const getGreeting = () => {
    if (isAdmin) return `Welcome Admin${user?.full_name ? `, ${user.full_name}` : ''}!`;
    if (isLandlord) return `Welcome back${user?.full_name ? `, ${user.full_name}` : ''}!`;
    if (isTenant) return `Welcome${user?.full_name ? `, ${user.full_name}` : ''}!`;
    return 'Welcome!';
  };

  const getSubtitle = () => {
    if (isAdmin) return 'System Administrator Dashboard';
    if (isLandlord) return user?.company_name || 'Your Property Management Dashboard';
    if (isTenant) {
      const property = properties[0];
      return property ? `Tenant at ${property.name}` : 'Your Tenant Dashboard';
    }
    return 'Your Dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{getGreeting()}</h1>
              <p className="text-lg text-gray-600 mt-1">{getSubtitle()}</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Link to={createPageUrl("Admin")}>
                  <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              {isLandlord && (
                <>
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Tenant
                  </Button>
                  <Link to={createPageUrl("AddProperty")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                  </Link>
                </>
              )}
              {isTenant && (
                <Link to={createPageUrl("ReportFault")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Fault
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {user?.subscription_status === 'trial' && user?.trial_end_date && isLandlord && (
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              Trial ends {new Date(user.trial_end_date).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Admin Broadcast Alert for Landlords */}
        {isLandlord && stats.adminBroadcasts > 0 && (
          <Link to={createPageUrl("Community")}>
            <Card className="mb-6 border-2 border-red-500 hover:shadow-xl transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">System Administrator Announcements</h3>
                    <p className="text-sm text-gray-600">
                      You have {stats.adminBroadcasts} new announcement{stats.adminBroadcasts !== 1 ? 's' : ''} from the admin
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {stats.adminBroadcasts} New
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {!isTenant && (
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow relative overflow-visible">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Properties</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProperties}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                {stats.newProperties > 0 && (
                  <Badge className="bg-green-500 text-white mb-2 animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {stats.newProperties} New
                  </Badge>
                )}
                <Link to={createPageUrl("Properties")}>
                  <Button variant="link" className="p-0 h-auto text-blue-600">View all →</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isTenant && properties[0] && (
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">My Property</p>
                    <p className="text-lg font-bold text-gray-900 mt-2">{properties[0].name}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{properties[0].address}</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow relative overflow-visible">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isTenant ? "My Faults" : "Open Faults"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openFaults}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {stats.urgentFaults > 0 && (
                  <Badge className="bg-red-100 text-red-800">{stats.urgentFaults} Urgent</Badge>
                )}
                {stats.newFaults > 0 && (
                  <Badge className="bg-green-500 text-white animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {stats.newFaults} New
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed Faults</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedFaults}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {stats.totalFaults > 0 ? Math.round((stats.completedFaults / stats.totalFaults) * 100) : 0}% completion rate
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow relative overflow-visible">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {stats.newMessages > 0 && (
                  <Badge className="bg-green-500 text-white animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {stats.newMessages} New
                  </Badge>
                )}
              </div>
              <Link to={createPageUrl("Community")}>
                <Button variant="link" className="p-0 h-auto text-purple-600">View messages →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLandlord && (
            <Link to={createPageUrl("AddProperty")} className="block">
              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">Add Property</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {isTenant && (
            <Link to={createPageUrl("ReportFault")} className="block">
              <Card className="border-2 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">Report Fault</p>
                </CardContent>
              </Card>
            </Link>
          )}

          {!isTenant && (
            <Link to={createPageUrl("Properties")} className="block">
              <Card className="border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-medium text-gray-700">View Properties</p>
                </CardContent>
              </Card>
            </Link>
          )}

          <Link to={createPageUrl("Documents")} className="block">
            <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Documents</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("Community")} className="block">
            <Card className="border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Property Messages</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Faults */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{isTenant ? "My Recent Faults" : "Recent Faults"}</span>
              {!isTenant && (
                <Link to={createPageUrl("Properties")}>
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFaults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>{isTenant ? "You haven't reported any faults yet." : "No faults reported yet. Great job!"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFaults.map((fault) => {
                  const property = properties.find(p => p.id === fault.property_id);
                  const faultIsNew = isNew(fault.created_date);
                  return (
                    <div key={fault.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{fault.title}</h4>
                          {faultIsNew && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{property?.name || 'Unknown Property'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          fault.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          fault.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          fault.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {fault.priority}
                        </Badge>
                        <Badge variant="outline">{fault.status.replace(/_/g, ' ')}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {isLandlord && (
          <InviteTenantModal 
            open={showInviteModal} 
            onClose={() => setShowInviteModal(false)} 
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}