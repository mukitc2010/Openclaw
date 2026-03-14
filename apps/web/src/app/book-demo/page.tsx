export default function BookDemoPage() {
  return (
    <div className="page-enter">
      <section className="card reveal">
        <p className="section-label">Book Demo</p>
        <h1 className="section-h2">Schedule an enterprise walkthrough</h1>
        <p className="section-sub">
          See how robolog.us supports multi-agent planning, QA workflows, and governed release operations for delivery teams.
        </p>
      </section>

      <section className="card reveal delay-1">
        <h3 className="section-title">What we cover in the demo</h3>
        <ul>
          <li>From brief to board workflow with PM, Agile, architecture, and QA modules</li>
          <li>Service architecture and deployment model for enterprise environments</li>
          <li>Security, governance, and release control practices</li>
          <li>Pilot plan with success criteria and rollout checkpoints</li>
        </ul>
      </section>

      <section className="card reveal delay-2">
        <h3 className="section-title">Demo request</h3>
        <p className="state-text">Email: sales@robolog.us</p>
        <p className="state-text">Include team size, use case, and preferred timeline for faster scheduling.</p>
      </section>
    </div>
  );
}
