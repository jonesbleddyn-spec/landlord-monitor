import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building2,
  AlertCircle
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

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

  const features = [
    {
      icon: Zap,
      title: "Maintenance Automation",
      description: "Automates maintenance workflow with transparent fault history from report to fix.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Sparkles,
      title: "AI Fault Analysis",
      description: "AI assistant analyzes uploaded images to recognize and create editable fault reports instantly.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Smart Reporting",
      description: "Create custom reports and identify patterns in faults to address systemic issues.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Online repository for storing contracts and property-related documents securely.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Build Community",
      description: "Exclusive messaging groups and community notice boards for each building.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Multi-Tenant SaaS",
      description: "Complete data isolation. Each landlord manages their own properties independently.",
      color: "from-red-500 to-pink-500"
    }
  ];

  const benefits = [
    "Reduce maintenance response time by 50%",
    "Complete data isolation for each landlord",
    "AI-powered image recognition for faster reporting",
    "Scalable SaaS platform for letting businesses",
    "Mobile-friendly for landlords and tenants",
    "Comprehensive analytics and insights"
  ];

  const handleGetStarted = () => {
    if (user) {
      if (user.onboarding_completed) {
        navigate(createPageUrl(user.user_type === 'landlord' ? "LandlordDashboard" : "Properties"));
      } else {
        navigate(createPageUrl("Onboarding"));
      }
    } else {
      base44.auth.redirectToLogin(createPageUrl("Onboarding"));
    }
  };

  const handleSignIn = () => {
    if (user && user.onboarding_completed) {
      navigate(createPageUrl(user.user_type === 'landlord' ? "LandlordDashboard" : "Properties"));
    } else {
      base44.auth.redirectToLogin();
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                Property Management for Modern Landlords
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Monitor properties, track maintenance, and manage tenants effortlessly with AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
                >
                  {user ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                {!user && (
                  <Button 
                    size="lg" 
                    onClick={handleSignIn}
                    className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
                  >
                    Sign In
                  </Button>
                )}
                <Link to={createPageUrl("PublicReportFault")}>
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    <AlertCircle className="mr-2 w-5 h-5" />
                    Report Fault
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative z-0">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" 
                  alt="Modern property"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">30-Day Free Trial</p>
                      <p className="text-sm text-gray-600">No credit card required</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Monitor Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A complete SaaS platform designed for letting businesses and landlords to streamline operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-none overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Letting Businesses
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our SaaS platform provides complete data isolation, ensuring each landlord's information remains private and secure.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" 
                alt="Property management dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <Building2 className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Free 30-Day Trial
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join letting businesses and landlords who trust Landlord Monitor. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}