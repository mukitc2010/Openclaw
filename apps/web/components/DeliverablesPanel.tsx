import { DeliverableBundle } from "@/types";

export function DeliverablesPanel({ deliverables }: { deliverables: DeliverableBundle }) {
  const cards = [
    { title: "PROJECT_PLAN.md", body: deliverables.project_plan },
    { title: "AGILE_PLAN.md", body: deliverables.agile_plan },
    { title: "ARCHITECTURE.md", body: deliverables.architecture },
    { title: "AI_ENGINEERING_PLAN.md", body: deliverables.ai_engineering_plan },
    { title: "AGENTS.md", body: deliverables.agents },
    { title: "GitHub Strategy", body: deliverables.github_strategy },
  ];

  return (
    <div className="deliverable-grid">
      {cards.map((item) => (
        <section key={item.title} className="card deliverable-card">
          <h3 className="section-title">{item.title}</h3>
          <pre className="deliverable-pre">
            {item.body}
          </pre>
        </section>
      ))}
    </div>
  );
}
