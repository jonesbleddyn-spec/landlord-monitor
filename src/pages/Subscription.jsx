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
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedRoute from "../components/auth/ProtectedRoute";

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

  const { data: plans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.SubscriptionPlan.list();
      const activePlans = allPlans.filter(p => p.is_active).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      
      // If more than 2 plans, put popular one in the middle
      if (activePlans.length > 2) {
        const popularIndex = activePlans.findIndex(p => p.is_popular);
        if (popularIndex !== -1) {
          const popularPlan = activePlans.splice(popularIndex, 1)[0];
          const middleIndex = Math.floor(activePlans.length / 2);
          activePlans.splice(middleIndex, 0, popularPlan);
        }
      }
      
      return activePlans;
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

  const { data: stripeSettings } = useQuery({
    queryKey: ['stripe-settings'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getSiteSettings');
      return response.data.settings || {};
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: async (planId) => {
      const plan = plans.find(p => p.id === planId);
      
      // Check if we're in an iframe (preview mode)
      if (window.self !== window.top) {
        throw new Error('IFRAME_CHECKOUT');
      }
      
      // Use Stripe checkout
      return await base44.functions.invoke('createStripeCheckout', { 
        price_id: plan.stripe_price_id || getStripePriceId(plan.name),
        plan_name: plan.name
      });
    },
    onSuccess: (data) => {
      if (data.data?.url) {
        window.location.href = data.data.url;
      } else {
        queryClient.invalidateQueries({ queryKey: ['user'] });
        setSelectedPlan(null);
      }
    },
    onError: (error) => {
      if (error.message === 'IFRAME_CHECKOUT') {
        alert('Checkout is only available in the published app. Please publish your app and open it in a new tab to complete checkout.');
      } else {
        alert('Failed to start checkout: ' + error.message);
      }
    }
  });

  const getStripePriceId = (planName) => {
    const priceMap = {
      'Basic Plan': 'price_1T3cR06TnKUeM8wD36H89LoO',
      'Pro Plan': 'price_1T3cR06TnKUeM8wD1HXxojay',
      'Enterprise Plan': 'price_1T3cR06TnKUeM8wDmxPOopQl'
    };
    return priceMap[planName] || '';
  };

  const currentPlan = user?.subscription_plan_id;
  const currentPlanDetails = plans.find(p => p.id === currentPlan);
  const isTrialActive = user?.subscription_status === 'trial';
  const trialDaysLeft = user?.trial_end_date 
    ? Math.max(0, Math.ceil((new Date(user.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleSelectPlan = async (planId) => {
    if (planId === currentPlan) return;
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setSelectedPlan(planId);
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
        {user && currentPlanDetails && (
          <Card className="mb-12 shadow-xl border-none overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Crown className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{currentPlanDetails.name}</h2>
                    <p className="text-white/90 mt-1">
                      {isTrialActive 
                        ? `${trialDaysLeft} days left in trial`
                        : currentPlanDetails.price === 0 
                          ? 'Free forever' 
                          : `${currentPlanDetails.currency} ${currentPlanDetails.price}/${currentPlanDetails.interval}`
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Properties</p>
                    <p className="text-2xl font-bold">
                      {currentPlanDetails.max_properties === -1 ? '∞' : currentPlanDetails.max_properties}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Storage</p>
                    <p className="text-2xl font-bold">{currentPlanDetails.storage_mb}MB</p>
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
          {loadingPlans ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
              <p className="text-gray-600 mt-4">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No subscription plans available</p>
            </div>
          ) : (
            <div className={`grid gap-8 ${plans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'}`}>
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    plan.id === currentPlan 
                      ? 'ring-4 ring-purple-600 shadow-2xl' 
                      : selectedPlan === plan.id
                        ? 'ring-4 ring-blue-400 shadow-xl'
                        : 'hover:shadow-xl'
                  } ${plan.is_popular ? 'md:scale-105' : ''}`}
                >
                  {plan.is_popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                        Popular
                      </Badge>
                    </div>
                  )}
                  {plan.id === currentPlan && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-purple-600 text-white">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                    <div className="flex items-center justify-between mb-4">
                      <Crown className="w-12 h-12" />
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {plan.currency} {plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-white/80">/{plan.interval}</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-8">
                    <ul className="space-y-3 mb-8">
                      {plan.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={plan.id === currentPlan || changePlanMutation.isPending}
                      className={`w-full ${
                        plan.id === currentPlan
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
                      }`}
                    >
                      {changePlanMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                      ) : !user ? (
                        'Sign Up'
                      ) : plan.id === currentPlan ? (
                        'Current Plan'
                      ) : selectedPlan === plan.id ? (
                        'Selected'
                      ) : currentPlanDetails && currentPlanDetails.price < plan.price ? (
                        'Upgrade'
                      ) : (
                        'Change Plan'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation */}
        {selectedPlan && selectedPlan !== currentPlan && user && (
          <Alert className="mb-12 bg-blue-50 border-blue-200">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-blue-900">
                {(() => {
                  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
                  return selectedPlanDetails && currentPlanDetails && selectedPlanDetails.price > currentPlanDetails.price
                    ? `Upgrade to ${selectedPlanDetails.name} for ${selectedPlanDetails.currency} ${selectedPlanDetails.price}/${selectedPlanDetails.interval}?`
                    : `Switch to ${selectedPlanDetails?.name}?`;
                })()}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                  disabled={changePlanMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmPlan}
                  disabled={changePlanMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {changePlanMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : (
                    'Confirm'
                  )}
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
                            {plans.find(p => p.id === payment.subscription_plan)?.name || payment.subscription_plan}
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