import { useAuth } from "../../hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(" ")[0] ?? "there"}.</h1>
        <p>Here's a snapshot of where the business stands today.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span>Pipeline value</span>
          <strong>—</strong>
        </div>
        <div className="stat-card">
          <span>Closed this quarter</span>
          <strong>—</strong>
        </div>
        <div className="stat-card">
          <span>Active customers</span>
          <strong>—</strong>
        </div>
        <div className="stat-card">
          <span>Your role</span>
          <strong>{user?.role ?? "—"}</strong>
        </div>
      </div>

      <div className="placeholder-card">
        <div className="icon-badge">01</div>
        <p style={{ margin: 0 }}>
          This is a placeholder dashboard. Analytics modules (pipeline, revenue, forecasting)
          will be built on top of this authenticated foundation.
        </p>
      </div>
    </>
  );
}
