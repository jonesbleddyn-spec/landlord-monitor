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
  Activity,
  Bell,
  CreditCard
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

  const { data: plans = [] } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
  });

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      change: "+12%",
      trending: "up"
    },
    {
      title: "Properties",
      value: properties.length,
      icon: Building2,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      change: "+8%",
      trending: "up"
    },
    {
      title: "Active Faults",
      value: faults.filter(f => !['completed', 'closed'].includes(f.status)).length,
      icon: AlertCircle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      change: "-5%",
      trending: "down"
    },
    {
      title: "Messages",
      value: messages.length,
      icon: MessageSquare,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      change: "+23%",
      trending: "up"
    },
    {
      title: "Documents",
      value: documents.length,
      icon: FileText,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      change: "+15%",
      trending: "up"
    },
    {
      title: "Revenue (Month)",
      value: `£${payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
      change: "+31%",
      trending: "up"
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
                <div className="flex items-center gap-1 text-sm">
                  {stat.trending === 'up' ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">{stat.change}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{stat.change}</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
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
              <CreditCard className="w-5 h-5" />
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plans.filter(p => p.is_active).map(plan => {
              const count = users.filter(u => u.subscription_plan_id === plan.id).length;
              return (
                <div key={plan.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">{plan.name}</span>
                  <span className="text-2xl font-bold text-blue-400">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* System Stats */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Active Reminders</span>
              <span className="text-2xl font-bold text-orange-400">
                {reminders.filter(r => !r.completed).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Open Faults</span>
              <span className="text-2xl font-bold text-red-400">
                {faults.filter(f => !['completed', 'closed'].includes(f.status)).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
              <span className="text-gray-300">Total Revenue</span>
              <span className="text-2xl font-bold text-emerald-400">
                £{payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(0)}
              </span>
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