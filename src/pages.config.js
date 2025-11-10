import Home from './pages/Home';
import ReportFault from './pages/ReportFault';
import Properties from './pages/Properties';
import Community from './pages/Community';
import Documents from './pages/Documents';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ReportFault": ReportFault,
    "Properties": Properties,
    "Community": Community,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};