import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Building2, MessageSquare, FileText, Menu, X, LayoutDashboard, LogOut, LogIn, CreditCard, HelpCircle, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
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
      if (!user?.landlord_id) return null;
      const landlords = await base44.entities.User.filter({ id: user.landlord_id });
      return landlords.length > 0 ? landlords[0] : null;
    },
    enabled: !!user?.landlord_id && isTenant,
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
    : (siteSettings?.site_name || 'Landlord Maint');
  
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

  const supportEmail = siteSettings?.support_email || 'support@landlordmaint.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={user ? createPageUrl("Dashboard") : createPageUrl("Home")} className="flex items-center gap-3">
              {displayLogo ? (
                <>
                  <img
                    src={displayLogo}
                    alt={displayName}
                    className="h-12 object-contain max-w-[200px]"
                  />
                  <span className="text-xl md:text-2xl font-bold whitespace-nowrap" style={{ 
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
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
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
                <>
                  <Link to={createPageUrl("Subscription")}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-gray-600 hover:text-blue-600"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pricing
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogin}
                    className="ml-2 text-gray-600 hover:text-blue-600"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </>
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
                <>
                  <Link to={createPageUrl("Subscription")} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-blue-600"
                    >
                      <CreditCard className="w-5 h-5 mr-3" />
                      Pricing
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-blue-600"
                    onClick={handleLogin}
                  >
                    <LogIn className="w-5 h-5 mr-3" />
                    Login
                  </Button>
                </>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
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
              <p className="text-gray-400 max-w-md mb-4">
                Professional property management platform for landlords and letting agencies. 
                Streamline operations, improve tenant communication, and manage properties efficiently.
              </p>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span> 
                  <a href={`mailto:${supportEmail}`} className="hover:text-white transition-colors">
                    {supportEmail}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Phone:</span> 
                  <span>+44 (0) 20 1234 5678</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold">Address:</span> 
                  <span>123 Property Lane, London, UK, SW1A 1AA</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={createPageUrl("Home")} className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to={createPageUrl("Features")} className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to={createPageUrl("Subscription")} className="hover:text-white transition-colors">Pricing</Link></li>
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
              <div className="border-t border-gray-800 mt-8 pt-8">
              {(siteSettings?.social_facebook || siteSettings?.social_twitter || siteSettings?.social_linkedin || siteSettings?.social_instagram || siteSettings?.social_youtube) && (
              <div className="flex justify-center gap-4 mb-6">
                {siteSettings?.social_facebook && (
                  <a href={siteSettings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {siteSettings?.social_twitter && (
                  <a href={siteSettings.social_twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-400 flex items-center justify-center transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {siteSettings?.social_linkedin && (
                  <a href={siteSettings.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-700 flex items-center justify-center transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {siteSettings?.social_instagram && (
                  <a href={siteSettings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-pink-600 flex items-center justify-center transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {siteSettings?.social_youtube && (
                  <a href={siteSettings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-red-600 flex items-center justify-center transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
              )}
              <p className="text-center text-gray-400">&copy; 2025 {displayName}. All rights reserved.</p>
              </div>
              </div>
              </footer>
    </div>
  );
}