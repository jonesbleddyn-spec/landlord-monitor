import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, MessageSquare, FileText, Menu, X, LayoutDashboard, LogOut, LogIn, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const { data: siteSettings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getSiteSettings');
        return response.data.settings || {};
      } catch {
        return {};
      }
    },
  });

  const isLandlord = user?.user_type === 'landlord';

  // Universal navigation for all logged-in users
  const commonNav = [
    { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: "Properties", url: createPageUrl("Properties"), icon: Building2 },
    { title: "Community", url: createPageUrl("Community"), icon: MessageSquare },
    { title: "Documents", url: createPageUrl("Documents"), icon: FileText },
  ];

  // Add subscription for landlords only
  const navigationItems = isLandlord ? [
    ...commonNav,
    { title: "Subscription", url: createPageUrl("Subscription"), icon: CreditCard },
  ] : commonNav;

  const isActive = (url) => location.pathname === url;

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Home"));
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Home"));
  };

  const supportEmail = siteSettings?.support_email || 'support@landlordmonitor.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={user ? createPageUrl("Dashboard") : createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {siteSettings?.site_name || 'Landlord Monitor'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {user && navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.url)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="ml-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogin}
                  className="ml-2 text-gray-600 hover:text-blue-600"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-4 space-y-2">
              {user && navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.url)
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              
              {user ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-blue-600"
                  onClick={handleLogin}
                >
                  <LogIn className="w-5 h-5 mr-3" />
                  Login
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">{siteSettings?.site_name || 'Landlord Monitor'}</span>
              </div>
              <p className="text-gray-400 max-w-md">
                SaaS property management platform for landlords and letting businesses. 
                Streamline operations and improve tenant satisfaction.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={createPageUrl("Home")} className="hover:text-white transition-colors">Home</Link></li>
                {user && (
                  <li><Link to={createPageUrl("Dashboard")} className="hover:text-white transition-colors">Dashboard</Link></li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{supportEmail}</li>
                <li>+44 20 1234 5678</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {siteSettings?.site_name || 'Landlord Monitor'}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}