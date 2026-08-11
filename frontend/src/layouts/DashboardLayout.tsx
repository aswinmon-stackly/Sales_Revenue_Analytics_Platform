import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";
import "./DashboardLayout.css";

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Dashboard" },
  { to: ROUTES.SALES, label: "Sales" },
  { to: ROUTES.CUSTOMERS, label: "Customers" },
  { to: ROUTES.REPORTS, label: "Reports" },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="dot" />
           Sales & Revenue Analytics Platform
        </div>

        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="who">
              <div className="name">{user?.name ?? "Unknown user"}</div>
              <div className="role">{role ?? ""}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
}
