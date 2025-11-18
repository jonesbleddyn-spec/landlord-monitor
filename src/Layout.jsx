import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, MessageSquare, FileText, Menu, X, LayoutDashboard, LogOut, LogIn, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CookieConsent from "../components/CookieConsent";

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

  const isTenant = user?.user_type === 'tenant';

  const { data: landlordBranding } = useQuery({
    queryKey: ['landlord-branding', user?.landlord_id],
    queryFn: async () => {
      if (!user?.landlord_id) {
        console.log('Layout: No landlord_id on user:', user);
        return null;
      }
      console.log('Layout: Fetching branding for landlord_id:', user.landlord_id);
      const users = await base44.entities.User.list();
      const landlord = users.find(u => u.id === user.landlord_id);
      console.log('Layout: Found landlord with branding:', {
        id: landlord?.id,
        company_name: landlord?.company_name,
        company_logo: landlord?.company_logo,
        brand_color_primary: landlord?.brand_color_primary,
        brand_color_secondary: landlord?.brand_color_secondary
      });
      return landlord;
    },
    enabled: !!user?.landlord_id && isTenant,
    staleTime: 0,
    cacheTime: 0,
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
  const isAdmin = user?.role === 'admin';

  // Get branding - use landlord branding for tenants, otherwise use site settings
  const useBranding = isTenant && landlordBranding && landlordBranding.company_name;
  
  const displayName = useBranding
    ? landlordBranding.company_name 
    : (siteSettings?.site_name || 'Landlord Monitor');
  
  const displayLogo = useBranding && landlordBranding.company_logo
    ? landlordBranding.company_logo 
    : null;
  
  const primaryColor = useBranding && landlordBranding.brand_color_primary
    ? landlordBranding.brand_color_primary 
    : '#3B82F6';
  
  const secondaryColor = useBranding && landlordBranding.brand_color_secondary
    ? landlordBranding.brand_color_secondary 
    : '#8B5CF6';
  
  console.log('Layout: Applied branding:', {
    isTenant,
    useBranding,
    displayName,
    displayLogo,
    primaryColor,
    secondaryColor
  });

  // Build navigation based on user type
  const getNavigationItems = () => {
    const baseNav = [
      { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
      { title: "Properties", url: createPageUrl("Properties"), icon: Building2 },
    ];

    // Admin only gets Dashboard and Properties
    if (isAdmin) {
      return baseNav;
    }

    // Landlords and Tenants get Community and Documents
    const fullNav = [
      ...baseNav,
      { title: "Community", url: createPageUrl("Community"), icon: MessageSquare },
      { title: "Documents", url: createPageUrl("Documents"), icon: FileText },
    ];

    // Add subscription for landlords only
    if (isLandlord) {
      return [...fullNav, { title: "Subscription", url: createPageUrl("Subscription"), icon: CreditCard }];
    }

    return fullNav;
  };

  const navigationItems = getNavigationItems();

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
              {displayLogo ? (
                <>
                  <img
                    src={displayLogo}
                    alt={displayName}
                    className="h-10 object-contain"
                  />
                  <span className="text-xl font-bold" style={{ 
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {displayName}
                  </span>
                </>
              ) : (
                <>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ 
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {displayName}
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {user && navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.url)
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={isActive(item.url) ? {
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  } : {}}
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
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={isActive(item.url) ? {
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                  } : {}}
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

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                {displayLogo ? (
                  <img
                    src={displayLogo}
                    alt={displayName}
                    className="h-10 object-contain bg-white p-1 rounded"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                )}
                <span className="text-xl font-bold">{displayName}</span>
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
                <li>
                  <Link to={createPageUrl("Help")} className="hover:text-white transition-colors flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Help & User Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={createPageUrl("TermsOfService")} className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to={createPageUrl("CookiePolicy")} className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 {displayName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}