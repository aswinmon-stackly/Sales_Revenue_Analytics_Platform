// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { ProtectedRoute } from "./routes/ProtectedRoute";
// import { DashboardLayout } from "./layouts/DashboardLayout";
// import { LoginPage } from "./pages/auth/LoginPage";
// import { DashboardPage } from "./pages/dashboard/DashboardPage";
// import { PlaceholderPage } from "./pages/dashboard/PlaceholderPage";
// import { ROUTES } from "./constants/routes";

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route path={ROUTES.LOGIN} element={<LoginPage />} />

//           <Route
//             path={ROUTES.DASHBOARD}
//             element={
//               <ProtectedRoute>
//                 <DashboardLayout>
//                   <DashboardPage />
//                 </DashboardLayout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path={ROUTES.SALES}
//             element={
//               <ProtectedRoute>
//                 <DashboardLayout>
//                   <PlaceholderPage
//                     title="Sales"
//                     description="Pipeline and deal-level detail will live here."
//                     badge="02"
//                   />
//                 </DashboardLayout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path={ROUTES.CUSTOMERS}
//             element={
//               <ProtectedRoute>
//                 <DashboardLayout>
//                   <PlaceholderPage
//                     title="Customers"
//                     description="Account health and customer records will live here."
//                     badge="03"
//                   />
//                 </DashboardLayout>
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path={ROUTES.REPORTS}
//             element={
//               <ProtectedRoute>
//                 <DashboardLayout>
//                   <PlaceholderPage
//                     title="Reports"
//                     description="Saved and scheduled reports will live here."
//                     badge="04"
//                   />
//                 </DashboardLayout>
//               </ProtectedRoute>
//             }
//           />

//           <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
//           <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { routes } from './routes/routeConfig';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.protected ? (
                <ProtectedRoute>{route.element}</ProtectedRoute>
              ) : (
                route.element
              )
            }
          />
        ))}
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;