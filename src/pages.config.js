/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddProperty from './pages/AddProperty';
import Admin from './pages/Admin';
import Community from './pages/Community';
import CookiePolicy from './pages/CookiePolicy';
import Dashboard from './pages/Dashboard';
import DebugBranding from './pages/DebugBranding';
import Documents from './pages/Documents';
import EditProperty from './pages/EditProperty';
import Features from './pages/Features';
import Help from './pages/Help';
import Home from './pages/Home';
import LandlordDashboard from './pages/LandlordDashboard';
import ManageInvitations from './pages/ManageInvitations';
import ManageProperties from './pages/ManageProperties';
import Onboarding from './pages/Onboarding';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Properties from './pages/Properties';
import PublicReportFault from './pages/PublicReportFault';
import Reminders from './pages/Reminders';
import ReportFault from './pages/ReportFault';
import Subscription from './pages/Subscription';
import TermsOfService from './pages/TermsOfService';
import WhiteLabelSettings from './pages/WhiteLabelSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddProperty": AddProperty,
    "Admin": Admin,
    "Community": Community,
    "CookiePolicy": CookiePolicy,
    "Dashboard": Dashboard,
    "DebugBranding": DebugBranding,
    "Documents": Documents,
    "EditProperty": EditProperty,
    "Features": Features,
    "Help": Help,
    "Home": Home,
    "LandlordDashboard": LandlordDashboard,
    "ManageInvitations": ManageInvitations,
    "ManageProperties": ManageProperties,
    "Onboarding": Onboarding,
    "PrivacyPolicy": PrivacyPolicy,
    "Properties": Properties,
    "PublicReportFault": PublicReportFault,
    "Reminders": Reminders,
    "ReportFault": ReportFault,
    "Subscription": Subscription,
    "TermsOfService": TermsOfService,
    "WhiteLabelSettings": WhiteLabelSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};