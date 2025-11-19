import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Building2, 
  AlertCircle, 
  MessageSquare, 
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity
} from "lucide-react";

export default function AdminStats() {
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['admin-faults'],
    queryFn: () => base44.entities.Fault.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.Message.list('-created_date'),
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: () => base44.entities.Document.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['admin-reminders'],
    queryFn: () => base44.entities.Reminder.list('-created_date'),
  });

  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['admin-subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
  });

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      detail: `${users.filter(u => u.user_type === 'landlord').length} Landlords, ${users.filter(u => u.user_type === 'tenant').length} Tenants`
    },
    {
      title: "Properties",
      value: properties.length,
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      detail: `${properties.reduce((sum, p) => sum + (p.units || 0), 0)} total units`
    },
    {
      title: "Active Faults",
      value: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      detail: `${faults.filter(f => f.priority === 'urgent' && !['completed', 'closed'].includes(f.status)).length} urgent`
    },
    {
      title: "Messages",
      value: messages.length,
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      detail: `${messages.filter(m => m.is_admin_broadcast).length} broadcasts sent`
    },
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      detail: `${documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length} expired`
    },
    {
      title: "Revenue (Total)",
      value: `£${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      detail: `${payments.filter(p => p.status === 'completed').length} completed payments`
    }
  ];

  const landlords = users.filter(u => u.user_type === 'landlord').length;
  const tenants = users.filter(u => u.user_type === 'tenant').length;
  const subscriptionStats = users.reduce((acc, user) => {
    if (user.subscription_plan) {
      acc[user.subscription_plan] = (acc[user.subscription_plan] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gray-700 bg-gray-800/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
              {stat.detail && (
                <p className="text-xs text-gray-500">{stat.detail}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Types */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Landlords</span>
              <span className="text-2xl font-bold text-blue-400">{landlords}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Tenants</span>
              <span className="text-2xl font-bold text-purple-400">{tenants}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Admins</span>
              <span className="text-2xl font-bold text-green-400">
                {users.filter(u => u.role === 'admin').length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Subscription Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span className="text-gray-300">Free/Trial</span>
                <p className="text-xs text-gray-500">30-day trial period</p>
              </div>
              <span className="text-2xl font-bold text-gray-400">
                {subscriptionStats.free || subscriptionStats.trial || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span className="text-gray-300">Basic</span>
                <p className="text-xs text-gray-500">Up to 10 properties</p>
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                {subscriptionStats.basic || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span className="text-gray-300">Pro</span>
                <p className="text-xs text-gray-500">Unlimited properties</p>
              </div>
              <span className="text-2xl font-bold text-emerald-400">
                {subscriptionStats.pro || 0}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Plans:</span>
                <span className="text-white font-semibold">{subscriptionPlans.filter(p => p.is_active).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {faults.slice(0, 5).map((fault) => {
              const property = properties.find(p => p.id === fault.property_id);
              return (
                <div key={fault.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-white font-medium">{fault.title}</p>
                      <p className="text-sm text-gray-400">{property?.name || 'Unknown Property'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(fault.created_date).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}