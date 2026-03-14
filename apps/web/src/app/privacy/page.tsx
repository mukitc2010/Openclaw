export default function PrivacyPage() {
  return (
    <div className="page-enter">
      <section className="card reveal">
        <p className="section-label">Privacy</p>
        <h1 className="section-h2">Privacy overview</h1>
        <p className="section-sub">
          robolog.us handles project planning data for software delivery orchestration.
          This page provides a high-level privacy summary for evaluation workflows.
        </p>
      </section>

      <section className="card reveal delay-1">
        <h3 className="section-title">Data principles</h3>
        <ul>
          <li>Use only the minimum data required for planning and delivery outputs</li>
          <li>Maintain clear service boundaries for data flow visibility</li>
          <li>Support environment-specific deployment and access controls</li>
          <li>Use audit-friendly artifacts for operational traceability</li>
        </ul>
      </section>
    </div>
  );
}
