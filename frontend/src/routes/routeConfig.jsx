// import { LoginPage } from '../pages/auth/LoginPage';
// import Dashboardlayout from '../layouts/DashboardLayout';
// import dashboardpge from '../pages/dashboard/DashboardPage';

// export const routes = [
//   {
//     path: '/',
//     element: <LoginPage />,
//     protected: false,
//   },
//   {
//     path: '/dashboard',
//     element: <DashboardPage />,
//     protected: true,
//   },
// ];

import { LoginPage } from "../pages/auth/LoginPage"; 
import {DashboardPage} from "../pages/dashboard/DashboardPage"; 
import  ReportPage  from "../pages/Report/report";
import SalesPage from "../pages/sales/sales";
import CustomerPage from "../pages/Customer/customer";
import SettingsPage from "../components/settings/SettingsPage";

export const routes = 
[ 
  { path: "/login", 
    element: <LoginPage />, 
    protected: false, 
  }, 
  { path: "/dashboard", 
    element: <DashboardPage />, 
    protected: true, 
  }, 
    { path: "/reports", 
    element: <ReportPage />, 
    protected: true, 
  }, 
  { path: "/sales", 
    element: <SalesPage />, 
        protected: true, 
      }, 
  { path: "/customers", 
    element: <CustomerPage />, 
    protected: true, 
  }, 
  { path: "/settings", 
    element: <SettingsPage />, 
    protected: true, 
  }, 
];