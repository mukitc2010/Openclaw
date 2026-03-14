export default function SecurityPage() {
  return (
    <div className="page-enter">
      <section className="card reveal">
        <p className="section-label">Security</p>
        <h1 className="section-h2">Security and compliance posture</h1>
        <p className="section-sub">
          robolog.us is designed for enterprise-grade delivery governance with secure architecture boundaries,
          role-focused workflows, and auditable output artifacts.
        </p>
      </section>

      <section className="card reveal delay-1">
        <h3 className="section-title">Platform controls</h3>
        <ul>
          <li>Role-aware delivery workflows and ownership boundaries</li>
          <li>API-first architecture with explicit service segregation</li>
          <li>Environment-based configuration for production isolation</li>
          <li>Versioned deployment pipelines with CI build verification</li>
        </ul>
      </section>

      <section className="card reveal delay-2">
        <h3 className="section-title">Operational safeguards</h3>
        <ul>
          <li>Health checks for service availability and readiness</li>
          <li>QA testing artifact generation for release confidence</li>
          <li>Documented microservice deployment workflows in GitHub Actions</li>
          <li>Security review checkpoints embedded in planning output</li>
        </ul>
      </section>
    </div>
  );
}
