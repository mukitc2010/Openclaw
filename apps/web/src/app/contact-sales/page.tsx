export default function ContactSalesPage() {
  return (
    <div className="page-enter">
      <section className="card reveal">
        <p className="section-label">Contact Sales</p>
        <h1 className="section-h2">Talk to enterprise sales</h1>
        <p className="section-sub">
          Discuss deployment options, procurement needs, and pilot planning with the robolog.us team.
        </p>
      </section>

      <section className="card reveal delay-1">
        <h3 className="section-title">Enterprise discussion points</h3>
        <ul>
          <li>Pricing and engagement model for teams and enterprise programs</li>
          <li>Security and compliance review process</li>
          <li>Integration architecture and rollout support</li>
          <li>Success metrics and delivery governance model</li>
        </ul>
      </section>

      <section className="card reveal delay-2">
        <h3 className="section-title">Sales contact</h3>
        <p className="state-text">Email: sales@robolog.us</p>
        <p className="state-text">For procurement and legal coordination, include your organization and target deployment window.</p>
      </section>
    </div>
  );
}
