import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MessageSquare,
  AlertCircle,
  FileText,
  Users,
  Smartphone,
  Bell,
  BarChart3,
  Clock,
  Upload,
  Calendar,
  Shield,
  Palette,
  Check,
  Zap,
  TrendingUp
} from "lucide-react";

export default function Features() {
  const featureCategories = [
    {
      title: "Property Management",
      icon: Building2,
      color: "from-blue-600 to-blue-700",
      features: [
        {
          name: "Unlimited Properties",
          description: "Manage any number of properties from a single dashboard",
          icon: Building2
        },
        {
          name: "Property Profiles",
          description: "Detailed property information including units, addresses, and manager contacts",
          icon: FileText
        },
        {
          name: "Bulk Import",
          description: "Import multiple properties via CSV for quick setup",
          icon: Upload
        },
        {
          name: "Property Codes",
          description: "Unique codes for each property for easy tenant access",
          icon: Shield
        }
      ]
    },
    {
      title: "Tenant Communication",
      icon: MessageSquare,
      color: "from-purple-600 to-purple-700",
      features: [
        {
          name: "Community Board",
          description: "Shared communication space for announcements and discussions",
          icon: MessageSquare
        },
        {
          name: "Tenant Invitations",
          description: "Secure invitation system to onboard tenants to specific properties",
          icon: Users
        },
        {
          name: "Announcements",
          description: "Broadcast important updates to all tenants across properties",
          icon: Zap
        },
        {
          name: "White Label Branding",
          description: "Customize tenant experience with your company branding and colors",
          icon: Palette
        }
      ]
    },
    {
      title: "Maintenance & Fault Tracking",
      icon: AlertCircle,
      color: "from-red-600 to-red-700",
      features: [
        {
          name: "Fault Reporting",
          description: "Tenants can report issues with photos and descriptions",
          icon: AlertCircle
        },
        {
          name: "AI Image Analysis",
          description: "Automatic categorization and priority assessment of faults",
          icon: Zap
        },
        {
          name: "Status Tracking",
          description: "Track faults from reported to completion with status updates",
          icon: TrendingUp
        },
        {
          name: "Contractor Assignment",
          description: "Assign and track contractors for maintenance work",
          icon: Users
        },
        {
          name: "Priority Levels",
          description: "Categorize issues by urgency (low, medium, high, urgent)",
          icon: AlertCircle
        },
        {
          name: "Detailed Reports",
          description: "Generate PDF reports for individual properties or all properties",
          icon: FileText
        }
      ]
    },
    {
      title: "Document Management",
      icon: FileText,
      color: "from-green-600 to-green-700",
      features: [
        {
          name: "Secure Storage",
          description: "Store contracts, certificates, and important documents securely",
          icon: Shield
        },
        {
          name: "Document Categories",
          description: "Organize by type: contracts, leases, certificates, inspections",
          icon: FileText
        },
        {
          name: "Expiry Tracking",
          description: "Track certificate expiry dates and receive reminders",
          icon: Calendar
        },
        {
          name: "Tenant Access",
          description: "Share relevant documents with tenants for their property",
          icon: Users
        }
      ]
    },
    {
      title: "Reminders & Compliance",
      icon: Bell,
      color: "from-orange-600 to-orange-700",
      features: [
        {
          name: "Custom Reminders",
          description: "Set reminders for maintenance, inspections, and renewals",
          icon: Bell
        },
        {
          name: "Email Notifications",
          description: "Automatic email alerts before important dates",
          icon: Smartphone
        },
        {
          name: "Compliance Tracking",
          description: "Track gas, electrical, and EPC certificate expiry dates",
          icon: Shield
        },
        {
          name: "SMS Notifications",
          description: "Send SMS alerts for urgent matters (with Twilio integration)",
          icon: Smartphone
        }
      ]
    },
    {
      title: "Analytics & Reporting",
      icon: BarChart3,
      color: "from-indigo-600 to-indigo-700",
      features: [
        {
          name: "Property Analytics",
          description: "View fault statistics and trends for each property",
          icon: BarChart3
        },
        {
          name: "Completion Rates",
          description: "Track maintenance completion rates and response times",
          icon: TrendingUp
        },
        {
          name: "Export Reports",
          description: "Download reports in CSV and PDF formats",
          icon: FileText
        },
        {
          name: "Dashboard Overview",
          description: "Real-time overview of all properties and pending issues",
          icon: Clock
        }
      ]
    }
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Reduce administrative overhead with automated notifications and centralized management",
      icon: Clock
    },
    {
      title: "Improve Tenant Satisfaction",
      description: "Quick response to issues and transparent communication keeps tenants happy",
      icon: Users
    },
    {
      title: "Stay Compliant",
      description: "Never miss certificate renewals or inspection dates with automatic reminders",
      icon: Shield
    },
    {
      title: "Reduce Costs",
      description: "Faster issue resolution and preventative maintenance reduce long-term costs",
      icon: TrendingUp
    },
    {
      title: "Professional Image",
      description: "White-label branding and organized communication enhance your professional reputation",
      icon: Palette
    },
    {
      title: "Scale Easily",
      description: "Manage unlimited properties without increasing administrative burden",
      icon: Building2
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800">Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Manage Properties</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Landlord Maint is a comprehensive property management platform designed for landlords and letting agencies to streamline operations and improve tenant relationships.
          </p>
        </div>

        {/* Feature Categories */}
        {featureCategories.map((category, index) => (
          <div key={index} className="mb-16">
            <Card className="border-none shadow-xl overflow-hidden">
              <CardHeader className={`bg-gradient-to-r ${category.color} text-white p-8`}>
                <div className="flex items-center gap-4">
                  {React.createElement(category.icon, { className: "w-10 h-10" })}
                  <CardTitle className="text-3xl">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center flex-shrink-0`}>
                        {React.createElement(feature.icon, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Benefits Section */}
        <div className="mb-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            How Your Business Benefits
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our platform is designed to solve real property management challenges and deliver measurable results
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4">
                    {React.createElement(benefit.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Property Management?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            See how our platform can help you save time, reduce costs, and improve tenant satisfaction.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to={createPageUrl("Subscription")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                View Pricing Plans
              </Button>
            </Link>
            <Link to={createPageUrl("Home")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}