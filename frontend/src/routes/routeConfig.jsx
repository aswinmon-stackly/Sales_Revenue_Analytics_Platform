
import { LoginPage } from "../pages/auth/LoginPage"; 
import {DashboardPage} from "../pages/dashboard/DashboardPage"; 
import  ReportPage  from "../pages/Report/report";
import SalesPage from "../pages/Sales/sales";
import CustomerPage from "../pages/Customer/customer";
import SettingsPage from "../components/settings/SettingsPage";
import CategoriesPage from "../pages/Categories/categories";
import ProductsPage from "../pages/Products/products";

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
    { path: "/categories", 
    element: <CategoriesPage />, 
    protected: true, 
  }, 
  { path: "/products", 
    element: <ProductsPage />, 
    protected: true, 
  },
];