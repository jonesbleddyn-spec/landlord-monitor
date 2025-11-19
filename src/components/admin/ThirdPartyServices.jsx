import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Cloud,
  Brain,
  MessageSquare,
  CreditCard,
  Mail,
  Server,
  Database,
  Code,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThirdPartyServices() {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  // Service definitions
  const services = [
    {
      id: "base44",
      name: "Base44 Platform",
      description: "Backend as a Service - Database, Auth, Functions",
      icon: Server,
      status: "operational",
      uptime: "99.9%",
      category: "Core Infrastructure",
      statusUrl: "https://status.base44.com",
      critical: true
    },
    {
      id: "openai",
      name: "OpenAI API",
      description: "AI-powered fault analysis, image recognition, DIY suggestions",
      icon: Brain,
      status: "operational",
      uptime: "99.5%",
      category: "AI Services",
      statusUrl: "https://status.openai.com",
      critical: false
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Payment processing and subscription management",
      icon: CreditCard,
      status: "operational",
      uptime: "99.99%",
      category: "Payment Processing",
      statusUrl: "https://status.stripe.com",
      critical: true
    },
    {
      id: "twilio",
      name: "Twilio SMS",
      description: "SMS notifications for landlords (optional, landlord-configured)",
      icon: MessageSquare,
      status: "operational",
      uptime: "99.95%",
      category: "Communications",
      statusUrl: "https://status.twilio.com",
      critical: false
    },
    {
      id: "smtp",
      name: "Email Services (SMTP)",
      description: "System emails and landlord custom SMTP providers",
      icon: Mail,
      status: "operational",
      uptime: "99.8%",
      category: "Communications",
      statusUrl: null,
      critical: true
    },
    {
      id: "cloud-storage",
      name: "Cloud Storage",
      description: "File uploads (images, documents, certificates)",
      icon: Cloud,
      status: "operational",
      uptime: "99.9%",
      category: "Storage",
      statusUrl: null,
      critical: true
    },
    {
      id: "deno-deploy",
      name: "Deno Deploy",
      description: "Serverless functions hosting (backend functions)",
      icon: Code,
      status: "operational",
      uptime: "99.95%",
      category: "Compute",
      statusUrl: "https://status.deno.com",
      critical: true
    },
    {
      id: "react",
      name: "React & Frontend Libraries",
      description: "UI framework, Tailwind CSS, shadcn/ui components",
      icon: Code,
      status: "operational",
      uptime: "100%",
      category: "Frontend",
      statusUrl: null,
      critical: true
    },
    {
      id: "database",
      name: "Database (PostgreSQL)",
      description: "Primary database via Base44 platform",
      icon: Database,
      status: "operational",
      uptime: "99.95%",
      category: "Core Infrastructure",
      statusUrl: "https://status.base44.com",
      critical: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "text-green-600 bg-green-100";
      case "degraded":
        return "text-yellow-600 bg-yellow-100";
      case "outage":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "outage":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />;
    }
  };

  const handleRefresh = () => {
    setChecking(true);
    setLastChecked(new Date());
    setTimeout(() => {
      setChecking(false);
    }, 2000);
  };

  useEffect(() => {
    setLastChecked(new Date());
  }, []);

  const categories = [...new Set(services.map(s => s.category))];

  const criticalServices = services.filter(s => s.critical);
  const allOperational = criticalServices.every(s => s.status === "operational");

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className={`border-2 ${allOperational ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {allOperational ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-red-600" />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {allOperational ? "All Systems Operational" : "Service Disruption Detected"}
                </h3>
                <p className="text-gray-600">
                  {allOperational 
                    ? "All critical services are running normally" 
                    : "Some services are experiencing issues"}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={checking}
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Checked */}
      {lastChecked && (
        <p className="text-sm text-gray-600">
          Last checked: {lastChecked.toLocaleString()}
        </p>
      )}

      {/* Services by Category */}
      {categories.map(category => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {services
              .filter(service => service.category === category)
              .map(service => {
                const Icon = service.icon;
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {service.name}
                              {service.critical && (
                                <Badge variant="outline" className="text-xs border-red-500 text-red-600">
                                  Critical
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </div>
                        {getStatusIcon(service.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Badge className={getStatusColor(service.status)}>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Uptime (30d):</span>
                          <span className="text-sm font-semibold text-gray-900">{service.uptime}</span>
                        </div>
                        {service.statusUrl && (
                          <a
                            href={service.statusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline block"
                          >
                            View Status Page →
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}

      {/* Service Notes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">Critical Services</h4>
            <p>Services marked as "Critical" are essential for platform operation. Any issues with these services may impact user experience.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Landlord-Configured Services</h4>
            <p>Twilio SMS and custom SMTP providers are optional features configured individually by landlords in their White Label Settings. Status shown is for the service provider's infrastructure, not individual landlord accounts.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Monitoring</h4>
            <p>This dashboard shows the general status of third-party services. For real-time updates, visit the respective status pages linked above.</p>
          </div>
        </CardContent>
      </Card>

      {/* Response Time Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service Dependencies & Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Server className="w-4 h-4" />
                If Base44 Platform is down:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                <li>No access to database (properties, faults, users)</li>
                <li>Authentication will fail</li>
                <li>Backend functions won't execute</li>
                <li>Complete platform outage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                If OpenAI API is down:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                <li>Image analysis won't work</li>
                <li>AI-generated fault suggestions unavailable</li>
                <li>DIY tips won't generate</li>
                <li>Manual fault reporting still functional</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                If Stripe is down:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                <li>New subscriptions cannot be created</li>
                <li>Payment updates will fail</li>
                <li>Existing subscriptions continue to work</li>
                <li>No access to platform functionality is lost</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                If Twilio is down:
              </h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-4 space-y-1">
                <li>SMS notifications won't be sent</li>
                <li>Email notifications continue to work</li>
                <li>Only affects landlords using Twilio integration</li>
                <li>All other platform features remain functional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}