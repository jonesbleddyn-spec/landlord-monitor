import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Filter,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

export default function AdminReports() {
  const [reportType, setReportType] = useState("landlords");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['admin-faults'],
    queryFn: () => base44.entities.Fault.list('-created_date'),
  });

  // Filter users based on date range
  const filterByDate = (items, dateField = 'created_date') => {
    if (dateRange === "all") return items;
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return items.filter(item => new Date(item[dateField]) >= cutoffDate);
  };

  // Landlords Report
  const landlords = users.filter(u => u.user_type === 'landlord');
  const filteredLandlords = subscriptionFilter === "all" 
    ? landlords 
    : landlords.filter(l => l.subscription_plan === subscriptionFilter);

  const landlordStats = filteredLandlords.map(landlord => {
    const landlordProperties = properties.filter(p => p.landlord_id === landlord.id);
    const landlordPayments = payments.filter(p => p.landlord_id === landlord.id && p.status === 'completed');
    const totalRevenue = landlordPayments.reduce((sum, p) => sum + p.amount, 0);
    const landlordFaults = faults.filter(f => f.landlord_id === landlord.id);

    return {
      ...landlord,
      property_count: landlordProperties.length,
      total_revenue: totalRevenue,
      fault_count: landlordFaults.length,
      last_payment: landlordPayments[0]?.created_date || 'Never'
    };
  });

  // Tenants Report
  const tenants = users.filter(u => u.user_type === 'tenant');
  const tenantStats = tenants.map(tenant => {
    const tenantFaults = faults.filter(f => f.created_by === tenant.email);
    return {
      ...tenant,
      fault_reports: tenantFaults.length,
      last_activity: tenantFaults[0]?.created_date || tenant.created_date
    };
  });

  // Subscription Report
  const subscriptionReport = {
    free: {
      count: users.filter(u => u.subscription_plan === 'free').length,
      revenue: 0
    },
    basic: {
      count: users.filter(u => u.subscription_plan === 'basic').length,
      revenue: payments.filter(p => p.subscription_plan === 'basic' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    },
    pro: {
      count: users.filter(u => u.subscription_plan === 'pro').length,
      revenue: payments.filter(p => p.subscription_plan === 'pro' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    }
  };

  // Finance Report
  const recentPayments = filterByDate(payments);
  const financeStats = {
    total_revenue: recentPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending_revenue: recentPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    failed_payments: recentPayments.filter(p => p.status === 'failed').length,
    refunded: recentPayments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
    transaction_count: recentPayments.length
  };

  const handleExport = () => {
    let data = [];
    let filename = "";

    switch(reportType) {
      case "landlords":
        data = landlordStats;
        filename = "landlords-report.csv";
        break;
      case "tenants":
        data = tenantStats;
        filename = "tenants-report.csv";
        break;
      case "subscriptions":
        data = Object.entries(subscriptionReport).map(([plan, stats]) => ({
          plan,
          ...stats
        }));
        filename = "subscriptions-report.csv";
        break;
      case "finance":
        data = recentPayments;
        filename = "finance-report.csv";
        break;
    }

    // Convert to CSV
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlords">Landlords Report</SelectItem>
                  <SelectItem value="tenants">Tenants Report</SelectItem>
                  <SelectItem value="subscriptions">Subscription Report</SelectItem>
                  <SelectItem value="finance">Finance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "landlords" && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Subscription Filter</label>
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
              <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExport}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Landlords Report */}
      {reportType === "landlords" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Landlords</p>
                    <p className="text-2xl font-bold text-white">{filteredLandlords.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Properties</p>
                    <p className="text-2xl font-bold text-white">
                      {landlordStats.reduce((sum, l) => sum + l.property_count, 0)}
                    </p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      £{landlordStats.reduce((sum, l) => sum + l.total_revenue, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Properties</p>
                    <p className="text-2xl font-bold text-white">
                      {(landlordStats.reduce((sum, l) => sum + l.property_count, 0) / (filteredLandlords.length || 1)).toFixed(1)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Landlord Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Properties</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Revenue</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Faults</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {landlordStats.map((landlord) => (
                      <tr key={landlord.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="py-3 px-4 text-white">{landlord.full_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-300">{landlord.email}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            landlord.subscription_plan === 'pro' ? 'bg-emerald-600' :
                            landlord.subscription_plan === 'basic' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }>
                            {landlord.subscription_plan || 'free'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-white">{landlord.property_count}</td>
                        <td className="py-3 px-4 text-green-400">£{landlord.total_revenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-white">{landlord.fault_count}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {format(new Date(landlord.created_date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tenants Report */}
      {reportType === "tenants" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Tenants</p>
                    <p className="text-2xl font-bold text-white">{tenants.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Fault Reports</p>
                    <p className="text-2xl font-bold text-white">
                      {tenantStats.reduce((sum, t) => sum + t.fault_reports, 0)}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Reports/Tenant</p>
                    <p className="text-2xl font-bold text-white">
                      {(tenantStats.reduce((sum, t) => sum + t.fault_reports, 0) / (tenants.length || 1)).toFixed(1)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Tenant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Fault Reports</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Activity</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantStats.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="py-3 px-4 text-white">{tenant.full_name || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-300">{tenant.email}</td>
                        <td className="py-3 px-4 text-white">{tenant.fault_reports}</td>
                        <td className="py-3 px-4 text-gray-400">
                          {format(new Date(tenant.last_activity), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {format(new Date(tenant.created_date), 'MMM d, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Report */}
      {reportType === "subscriptions" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(subscriptionReport).map(([plan, stats]) => (
              <Card key={plan} className="border-gray-700 bg-gray-800/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white capitalize flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {plan} Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Subscribers</p>
                    <p className="text-3xl font-bold text-white">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">£{stats.revenue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Avg Revenue/User</p>
                    <p className="text-xl font-bold text-blue-400">
                      £{stats.count > 0 ? (stats.revenue / stats.count).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(subscriptionReport).map(([plan, stats]) => {
                  const total = Object.values(subscriptionReport).reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? (stats.count / total * 100).toFixed(1) : 0;
                  return (
                    <div key={plan} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 capitalize">{plan}</span>
                        <span className="text-white font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            plan === 'pro' ? 'bg-emerald-600' :
                            plan === 'basic' ? 'bg-yellow-600' :
                            'bg-gray-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Finance Report */}
      {reportType === "finance" && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">
                      £{financeStats.total_revenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      £{financeStats.pending_revenue.toFixed(2)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Failed Payments</p>
                    <p className="text-2xl font-bold text-red-400">{financeStats.failed_payments}</p>
                  </div>
                  <FileText className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Refunded</p>
                    <p className="text-2xl font-bold text-orange-400">
                      £{financeStats.refunded.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Landlord</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Plan</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Payment Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.slice(0, 20).map((payment) => {
                      const landlord = users.find(u => u.id === payment.landlord_id);
                      return (
                        <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="py-3 px-4 text-gray-400">
                            {format(new Date(payment.created_date), 'MMM d, yyyy')}
                          </td>
                          <td className="py-3 px-4 text-white">{landlord?.email || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              payment.subscription_plan === 'pro' ? 'bg-emerald-600' :
                              payment.subscription_plan === 'basic' ? 'bg-yellow-600' :
                              'bg-gray-600'
                            }>
                              {payment.subscription_plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-white">£{payment.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              payment.status === 'completed' ? 'bg-green-600' :
                              payment.status === 'pending' ? 'bg-yellow-600' :
                              payment.status === 'failed' ? 'bg-red-600' :
                              'bg-gray-600'
                            }>
                              {payment.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{payment.payment_method || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}