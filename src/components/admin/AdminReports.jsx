import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp,
  Download,
  Calendar,
  Eye,
  Trash2,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function AdminReports() {
  const queryClient = useQueryClient();
  const [reportType, setReportType] = useState("landlords");
  const [dateFilter, setDateFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [sortField, setSortField] = useState("created_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToChangePlan, setUserToChangePlan] = useState(null);
  const [newPlan, setNewPlan] = useState("");
  const [ghostViewUser, setGhostViewUser] = useState(null);

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.asServiceRole.entities.User.list(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => base44.asServiceRole.entities.Property.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.asServiceRole.entities.Payment.list('-created_date'),
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['admin-faults'],
    queryFn: () => base44.asServiceRole.entities.Fault.list('-created_date'),
  });

  const { data: ghostData, isLoading: loadingGhostData } = useQuery({
    queryKey: ['ghost-user-data', ghostViewUser?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserData', { user_id: ghostViewUser.id });
      return response.data;
    },
    enabled: !!ghostViewUser,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.functions.invoke('deleteUser', { user_id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-faults'] });
      toast.success("User deleted successfully");
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  });

  const changePlanMutation = useMutation({
    mutationFn: ({ userId, plan }) => base44.functions.invoke('changeUserPlan', { user_id: userId, new_plan: plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success("Plan changed successfully");
      setUserToChangePlan(null);
      setNewPlan("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to change plan");
    }
  });

  const filterDataByDate = (data, dateField = 'created_date') => {
    if (dateFilter === 'all') return data;
    
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item[dateField]);
      switch(dateFilter) {
        case '7days': return (now - itemDate) / (1000 * 60 * 60 * 24) <= 7;
        case '30days': return (now - itemDate) / (1000 * 60 * 60 * 24) <= 30;
        case '90days': return (now - itemDate) / (1000 * 60 * 60 * 24) <= 90;
        default: return true;
      }
    });
    return filtered;
  };

  const getLandlordReport = () => {
    let data = users.filter(u => u.user_type === 'landlord');
    data = filterDataByDate(data);
    
    if (subscriptionFilter !== 'all') {
      data = data.filter(u => u.subscription_plan === subscriptionFilter);
    }

    return data.map(landlord => {
      const landlordProps = properties.filter(p => p.landlord_id === landlord.id);
      const landlordFaults = faults.filter(f => f.landlord_id === landlord.id);
      const landlordPayments = payments.filter(p => p.landlord_id === landlord.id);
      
      return {
        ...landlord,
        propertyCount: landlordProps.length,
        faultCount: landlordFaults.length,
        paymentCount: landlordPayments.length,
        totalRevenue: landlordPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
      };
    });
  };

  const getTenantReport = () => {
    let data = users.filter(u => u.user_type === 'tenant');
    data = filterDataByDate(data);
    
    return data.map(tenant => {
      const tenantFaults = faults.filter(f => f.created_by === tenant.email);
      // Get landlord info
      const landlord = users.find(u => u.id === tenant.landlord_id);
      return {
        ...tenant,
        faultCount: tenantFaults.length,
        openFaults: tenantFaults.filter(f => !['completed', 'closed'].includes(f.status)).length,
        landlordName: landlord?.company_name || landlord?.full_name || landlord?.email || 'N/A'
      };
    });
  };

  const getSubscriptionReport = () => {
    const landlords = users.filter(u => u.user_type === 'landlord');
    
    return [
      {
        plan: 'free',
        count: landlords.filter(l => l.subscription_plan === 'free' || l.subscription_status === 'trial').length,
        revenue: 0
      },
      {
        plan: 'basic',
        count: landlords.filter(l => l.subscription_plan === 'basic').length,
        revenue: landlords.filter(l => l.subscription_plan === 'basic').length * 29.99
      },
      {
        plan: 'pro',
        count: landlords.filter(l => l.subscription_plan === 'pro').length,
        revenue: landlords.filter(l => l.subscription_plan === 'pro').length * 79.99
      }
    ];
  };

  const getFinanceReport = () => {
    let data = filterDataByDate(payments, 'created_date');
    return data.map(payment => {
      const user = users.find(u => u.id === payment.landlord_id);
      return {
        ...payment,
        userName: user?.full_name || user?.email || 'Unknown'
      };
    });
  };

  const exportToCSV = () => {
    let data;
    let headers;
    
    switch(reportType) {
      case 'landlords':
        data = getLandlordReport();
        headers = ['Email', 'Name', 'Plan', 'Properties', 'Faults', 'Revenue', 'Joined'];
        break;
      case 'tenants':
        data = getTenantReport();
        headers = ['Email', 'Name', 'Landlord', 'Faults', 'Open Faults', 'Joined'];
        break;
      case 'finance':
        data = getFinanceReport();
        headers = ['Date', 'User', 'Amount', 'Plan', 'Status'];
        break;
      default:
        return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        switch(reportType) {
          case 'landlords':
            return [
              row.email,
              row.full_name || '',
              row.subscription_plan || 'free',
              row.propertyCount,
              row.faultCount,
              `£${row.totalRevenue.toFixed(2)}`,
              format(new Date(row.created_date), 'yyyy-MM-dd')
            ].join(',');
          case 'tenants':
            return [
              row.email,
              row.full_name || '',
              row.landlordName,
              row.faultCount,
              row.openFaults,
              format(new Date(row.created_date), 'yyyy-MM-dd')
            ].join(',');
          case 'finance':
            return [
              format(new Date(row.created_date), 'yyyy-MM-dd'),
              row.userName,
              `£${row.amount.toFixed(2)}`,
              row.subscription_plan,
              row.status
            ].join(',');
          default:
            return '';
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const handleChangePlan = (user) => {
    setUserToChangePlan(user);
    setNewPlan(user.subscription_plan || 'free');
  };

  const confirmChangePlan = () => {
    if (userToChangePlan && newPlan) {
      changePlanMutation.mutate({ userId: userToChangePlan.id, plan: newPlan });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-300">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlords">Landlords</SelectItem>
                  <SelectItem value="tenants">Tenants</SelectItem>
                  <SelectItem value="subscriptions">Subscriptions</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'landlords' && (
              <div>
                <Label className="text-gray-300">Subscription</Label>
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free/Trial</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-gray-300">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportToCSV}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlords Report */}
      {reportType === 'landlords' && (
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Landlords Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Properties</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Faults</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Revenue</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getLandlordReport().map((landlord) => (
                    <tr key={landlord.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-300">{landlord.email}</td>
                      <td className="py-3 px-4 text-gray-300">{landlord.full_name || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          landlord.subscription_plan === 'pro' ? 'bg-purple-600' :
                          landlord.subscription_plan === 'basic' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }>
                          {landlord.subscription_plan || 'free'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{landlord.propertyCount}</td>
                      <td className="py-3 px-4 text-gray-300">{landlord.faultCount}</td>
                      <td className="py-3 px-4 text-gray-300">£{landlord.totalRevenue.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGhostViewUser(landlord)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangePlan(landlord)}
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                          >
                            <Crown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(landlord)}
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenants Report */}
      {reportType === 'tenants' && (
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tenants Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Landlord</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Total Faults</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Open Faults</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Joined</th>
                    <th className="text-right py-3 px-4 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getTenantReport().map((tenant) => (
                    <tr key={tenant.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-300">{tenant.email}</td>
                      <td className="py-3 px-4 text-gray-300">{tenant.full_name || '-'}</td>
                      <td className="py-3 px-4 text-gray-300">{tenant.landlordName}</td>
                      <td className="py-3 px-4 text-gray-300">{tenant.faultCount}</td>
                      <td className="py-3 px-4 text-gray-300">
                        <Badge className={tenant.openFaults > 0 ? 'bg-yellow-600' : 'bg-green-600'}>
                          {tenant.openFaults}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {format(new Date(tenant.created_date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGhostViewUser(tenant)}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(tenant)}
                            className="border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Summary */}
      {reportType === 'subscriptions' && (
        <div className="grid md:grid-cols-3 gap-6">
          {getSubscriptionReport().map((sub) => (
            <Card key={sub.plan} className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white capitalize">{sub.plan} Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Subscribers</p>
                    <p className="text-3xl font-bold text-white">{sub.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-green-400">£{sub.revenue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Finance Report */}
      {reportType === 'finance' && (
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Finance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">User</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Plan</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFinanceReport().map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="py-3 px-4 text-gray-300">
                        {format(new Date(payment.created_date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{payment.userName}</td>
                      <td className="py-3 px-4 text-gray-300">£{payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-300">{payment.subscription_plan}</td>
                      <td className="py-3 px-4">
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-600' :
                          payment.status === 'pending' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete <strong>{userToDelete?.email}</strong>?
              {userToDelete?.user_type === 'landlord' && (
                <p className="mt-2 text-yellow-400">
                  ⚠️ This will also delete all their properties, faults, messages, documents, and payment records.
                </p>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Dialog */}
      <Dialog open={!!userToChangePlan} onOpenChange={() => setUserToChangePlan(null)}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Change Subscription Plan</DialogTitle>
            <DialogDescription className="text-gray-300">
              Change subscription plan for <strong>{userToChangePlan?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-gray-300">Select New Plan</Label>
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free/Trial</SelectItem>
                <SelectItem value="basic">Basic (£29.99/month)</SelectItem>
                <SelectItem value="pro">Pro (£79.99/month)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setUserToChangePlan(null)}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmChangePlan}
              disabled={changePlanMutation.isPending || !newPlan}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {changePlanMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Plan'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ghost View Dialog - Enhanced for Tenants */}
      <Dialog open={!!ghostViewUser} onOpenChange={() => setGhostViewUser(null)}>
        <DialogContent className="max-w-6xl bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Ghost View: {ghostViewUser?.email}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              <div className="flex items-center gap-2 mt-2">
                <Badge className={ghostViewUser?.user_type === 'landlord' ? 'bg-purple-600' : 'bg-blue-600'}>
                  {ghostViewUser?.user_type}
                </Badge>
                {ghostViewUser?.user_type === 'landlord' && ghostViewUser?.subscription_plan && (
                  <Badge variant="outline">{ghostViewUser.subscription_plan} plan</Badge>
                )}
              </div>
              <p className="mt-2">Viewing complete account data for troubleshooting</p>
            </DialogDescription>
          </DialogHeader>
          
          {loadingGhostData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : ghostData && (
            <div className="space-y-6 py-4">
              {/* User Info Card */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="text-sm font-medium text-white">{ghostData.user.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm font-medium text-white">{ghostData.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">User Type</p>
                      <Badge className="mt-1">{ghostData.user.user_type}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Joined</p>
                      <p className="text-sm font-medium text-white">
                        {format(new Date(ghostData.user.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Properties</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{ghostData.stats.totalProperties}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Open Faults</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{ghostData.stats.openFaults}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{ghostData.stats.completedFaults}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-700/50 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Messages</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{ghostData.stats.totalMessages}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Properties */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Properties {ghostData.user.user_type === 'tenant' ? '(Tenant Access)' : '(Owned)'}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ghostData.properties.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No properties</p>
                  ) : (
                    ghostData.properties.map(prop => (
                      <Card key={prop.id} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{prop.name}</p>
                              <p className="text-sm text-gray-400">{prop.address}</p>
                            </div>
                            <Badge variant="outline">{prop.units || 0} units</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Faults */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Recent Faults
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ghostData.faults.slice(0, 5).length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No faults reported</p>
                  ) : (
                    ghostData.faults.slice(0, 5).map(fault => (
                      <Card key={fault.id} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{fault.title}</p>
                              <p className="text-sm text-gray-400">
                                {fault.category} • {format(new Date(fault.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={
                                fault.priority === 'urgent' ? 'bg-red-600' :
                                fault.priority === 'high' ? 'bg-orange-600' :
                                'bg-yellow-600'
                              }>
                                {fault.priority}
                              </Badge>
                              <Badge variant="outline">{fault.status.replace(/_/g, ' ')}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Messages */}
              {ghostData.messages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Recent Messages
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ghostData.messages.slice(0, 3).map(msg => (
                      <Card key={msg.id} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {msg.title && <p className="font-medium text-white">{msg.title}</p>}
                              <p className="text-sm text-gray-400 line-clamp-2">{msg.content}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {format(new Date(msg.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant="outline">{msg.message_type}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {ghostData.documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents ({ghostData.stats.totalDocuments})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {ghostData.documents.slice(0, 5).map(doc => (
                      <Card key={doc.id} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-white">{doc.title}</p>
                              <p className="text-sm text-gray-400">{doc.document_type.replace(/_/g, ' ')}</p>
                            </div>
                            <Badge variant="outline">
                              {format(new Date(doc.created_date), 'MMM yyyy')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}