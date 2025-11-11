import Home from './pages/Home';
import ReportFault from './pages/ReportFault';
import Properties from './pages/Properties';
import Community from './pages/Community';
import Documents from './pages/Documents';
import Onboarding from './pages/Onboarding';
import LandlordDashboard from './pages/LandlordDashboard';
import AddProperty from './pages/AddProperty';
import ManageProperties from './pages/ManageProperties';
import Subscription from './pages/Subscription';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ReportFault": ReportFault,
    "Properties": Properties,
    "Community": Community,
    "Documents": Documents,
    "Onboarding": Onboarding,
    "LandlordDashboard": LandlordDashboard,
    "AddProperty": AddProperty,
    "ManageProperties": ManageProperties,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};