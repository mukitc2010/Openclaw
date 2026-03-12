import { AgentAssignment } from "@/types";

export function AssignmentMatrix({ assignments }: { assignments: AgentAssignment[] }) {
  return (
    <section className="card">
      <h3 className="section-title">Agent Assignment Matrix</h3>
      <div className="table-wrap">
        <table className="assignment-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Active Tasks</th>
              <th>Responsibilities</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item) => (
              <tr key={item.agent_name}>
                <td>{item.agent_name}</td>
                <td>
                  {item.active_task_ids.length ? item.active_task_ids.join(", ") : "-"}
                </td>
                <td>
                  {item.responsibilities.join(" | ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
