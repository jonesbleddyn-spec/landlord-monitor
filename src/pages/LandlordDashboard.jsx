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
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  UserPlus
} from "lucide-react";
import InviteTenantModal from "../components/landlord/InviteTenantModal";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function LandlordDashboardContent() {
  const [showInviteModal, setShowInviteModal] = React.useState(false);

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

  const { data: faults = [] } = useQuery({
    queryKey: ['landlord-faults'],
    queryFn: async () => {
      const allFaults = await base44.entities.Fault.list('-created_date');
      return allFaults.filter(f => f.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['landlord-messages'],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-created_date');
      return allMessages.filter(m => m.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const stats = {
    totalProperties: properties.length,
    totalFaults: faults.length,
    openFaults: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
    urgentFaults: faults.filter(f => f.priority === 'urgent').length,
    completedFaults: faults.filter(f => f.status === 'completed').length,
    totalMessages: messages.length
  };

  const recentFaults = faults.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Welcome back{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
              <p className="text-lg text-gray-600 mt-1">{user?.company_name || 'Your Property Management Dashboard'}</p>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
          
          {user?.subscription_status === 'trial' && user?.trial_end_date && (
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              Trial ends {new Date(user.trial_end_date).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
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
              <Link to={createPageUrl("ManageProperties")}>
                <Button variant="link" className="p-0 h-auto text-blue-600">View all →</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Faults</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openFaults}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stats.urgentFaults > 0 && (
                  <Badge className="bg-red-100 text-red-800">{stats.urgentFaults} Urgent</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
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

          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
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
              <Link to={createPageUrl("Community")}>
                <Button variant="link" className="p-0 h-auto text-purple-600">View community →</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to={createPageUrl("AddProperty")} className="block">
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Add Property</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl("ManageProperties")} className="block">
            <Card className="border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Manage Properties</p>
              </CardContent>
            </Card>
          </Link>

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
                <p className="font-medium text-gray-700">Community</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Faults */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Faults</span>
              <Link to={createPageUrl("ManageProperties")}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentFaults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No faults reported yet. Great job!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFaults.map((fault) => {
                  const property = properties.find(p => p.id === fault.property_id);
                  return (
                    <div key={fault.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{fault.title}</h4>
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
        <InviteTenantModal 
          open={showInviteModal} 
          onClose={() => setShowInviteModal(false)} 
        />
      </div>
    </div>
  );
}

export default function LandlordDashboard() {
  return (
    <ProtectedRoute requiredUserType="landlord">
      <LandlordDashboardContent />
    </ProtectedRoute>
  );
}