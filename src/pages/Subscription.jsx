import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Crown, 
  Zap, 
  Building2, 
  FileText, 
  Users, 
  TrendingUp,
  Calendar,
  CreditCard,
  Download,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const PLANS = {
  free: {
    name: "Free Trial",
    price: 0,
    interval: "30 days",
    icon: Building2,
    color: "from-gray-500 to-gray-600",
    features: [
      "Up to 2 properties",
      "Basic fault tracking",
      "Community board",
      "Document storage (50MB)",
      "Email support"
    ],
    limits: {
      properties: 2,
      storage_mb: 50
    }
  },
  basic: {
    name: "Basic",
    price: 29.99,
    interval: "month",
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    features: [
      "Up to 10 properties",
      "Advanced fault tracking",
      "Tenant invitations",
      "AI-powered reports",
      "Document storage (500MB)",
      "Priority email support",
      "Analytics dashboard"
    ],
    limits: {
      properties: 10,
      storage_mb: 500
    }
  },
  pro: {
    name: "Pro",
    price: 79.99,
    interval: "month",
    icon: Crown,
    color: "from-purple-500 to-pink-600",
    popular: true,
    features: [
      "Unlimited properties",
      "AI image analysis",
      "Bulk import properties",
      "Custom reporting",
      "Document storage (5GB)",
      "Priority support",
      "API access",
      "White-label options",
      "Dedicated account manager"
    ],
    limits: {
      properties: -1, // unlimited
      storage_mb: 5120
    }
  }
};

function SubscriptionContent() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const allPayments = await base44.entities.Payment.list('-created_date');
      return allPayments.filter(p => p.landlord_id === user.id);
    },
    enabled: !!user,
  });

  const changePlanMutation = useMutation({
    mutationFn: (plan) => base44.functions.invoke('changeSubscriptionPlan', { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setSelectedPlan(null);
    },
  });

  const currentPlan = user?.subscription_plan || 'free';
  const planDetails = PLANS[currentPlan];
  const isTrialActive = user?.subscription_status === 'trial';
  const trialDaysLeft = user?.trial_end_date 
    ? Math.max(0, Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleSelectPlan = async (planKey) => {
    if (planKey === currentPlan) return;
    setSelectedPlan(planKey);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan) return;
    await changePlanMutation.mutateAsync(selectedPlan);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription & Billing</h1>
          <p className="text-lg text-gray-600">
            Manage your subscription plan and view payment history
          </p>
        </div>

        {/* Current Plan Status - Only show if logged in */}
        {user && (
          <Card className="mb-12 shadow-xl border-none overflow-hidden">
            <div className={`bg-gradient-to-r ${planDetails.color} p-8 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    {React.createElement(planDetails.icon, { className: "w-8 h-8" })}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{planDetails.name}</h2>
                    <p className="text-white/90 mt-1">
                      {isTrialActive 
                        ? `${trialDaysLeft} days left in trial`
                        : planDetails.price === 0 
                          ? 'Free forever' 
                          : `£${planDetails.price}/${planDetails.interval}`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {user?.subscription_status === 'active' && (
                    <Badge className="bg-white/20 text-white text-sm">
                      <Check className="w-4 h-4 mr-1" />
                      Active
                    </Badge>
                  )}
                  {isTrialActive && (
                    <Badge className="bg-yellow-500 text-white text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Trial
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Properties</p>
                    <p className="text-2xl font-bold">
                      {planDetails.limits.properties === -1 ? '∞' : planDetails.limits.properties}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Storage</p>
                    <p className="text-2xl font-bold">{planDetails.limits.storage_mb}MB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Next Billing</p>
                    <p className="text-lg font-semibold">
                      {user?.next_billing_date 
                        ? format(new Date(user.next_billing_date), 'MMM d, yyyy')
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card 
                key={key}
                className={`relative overflow-hidden transition-all duration-300 ${
                  key === currentPlan 
                    ? 'ring-4 ring-purple-600 shadow-2xl' 
                    : selectedPlan === key
                      ? 'ring-4 ring-blue-400 shadow-xl'
                      : 'hover:shadow-xl'
                } ${plan.popular ? 'md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Popular
                    </Badge>
                  </div>
                )}
                {key === currentPlan && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-purple-600 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <CardHeader className={`bg-gradient-to-r ${plan.color} text-white p-8`}>
                  <div className="flex items-center justify-between mb-4">
                    {React.createElement(plan.icon, { className: "w-12 h-12" })}
                  </div>
                  <CardTitle className="text-3xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      £{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-white/80">/{plan.interval}</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => user ? handleSelectPlan(key) : base44.auth.redirectToLogin(window.location.pathname)}
                    disabled={key === currentPlan || changePlanMutation.isPending}
                    className={`w-full ${
                      key === currentPlan
                        ? 'bg-gray-300 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {!user 
                      ? 'Sign Up'
                      : key === currentPlan 
                        ? 'Current Plan' 
                        : key === selectedPlan
                          ? 'Selected'
                          : key === 'free'
                            ? 'Downgrade'
                            : PLANS[currentPlan].price < plan.price
                              ? 'Upgrade'
                              : 'Change Plan'
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Confirmation */}
        {selectedPlan && selectedPlan !== currentPlan && (
          <Alert className="mb-12 bg-blue-50 border-blue-200">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-blue-900">
                {PLANS[selectedPlan].price > PLANS[currentPlan].price 
                  ? `Upgrade to ${PLANS[selectedPlan].name} for £${PLANS[selectedPlan].price}/${PLANS[selectedPlan].interval}?`
                  : `Switch to ${PLANS[selectedPlan].name}?`
                }
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmPlan}
                  disabled={changePlanMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {changePlanMutation.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment History - Only show if logged in */}
        {user && (
          <Card className="shadow-xl border-none">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div 
                      key={payment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          payment.status === 'completed' ? 'bg-green-100' :
                          payment.status === 'pending' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {payment.status === 'completed' ? (
                            <Check className="w-6 h-6 text-green-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {PLANS[payment.subscription_plan]?.name || payment.subscription_plan}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(payment.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            £{payment.amount.toFixed(2)}
                          </p>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'outline'}>
                            {payment.status}
                          </Badge>
                        </div>
                        {payment.invoice_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(payment.invoice_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Subscription() {
  return <SubscriptionContent />;
}