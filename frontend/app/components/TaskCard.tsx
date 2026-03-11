import type { Task } from "@/types";
import StatusBadge from "./StatusBadge";

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-gray-500",
};

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const dot = priorityDot[task.priority?.toLowerCase()] ?? "bg-gray-500";

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-3 hover:border-gray-700 transition-colors">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-200 font-medium leading-snug mb-2">{task.title}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={task.priority} />
            {task.agent_assigned && (
              <span className="rounded-full bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-xs text-indigo-300">
                {task.agent_assigned}
              </span>
            )}
            {task.type && task.type !== "task" && (
              <span className="rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 text-xs text-gray-400">
                {task.type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
