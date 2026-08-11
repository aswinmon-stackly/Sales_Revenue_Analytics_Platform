interface PlaceholderPageProps {
  title: string;
  description: string;
  badge: string;
}

export function PlaceholderPage({ title, description, badge }: PlaceholderPageProps) {
  return (
    <>
      <div className="page-header">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="placeholder-card">
        <div className="icon-badge">{badge}</div>
        <p style={{ margin: 0 }}>This module hasn't been built yet — it's reachable now that authentication and routing are wired up.</p>
      </div>
    </>
  );
}
