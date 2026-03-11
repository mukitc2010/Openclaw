"use client";

import type { Task } from "@/types";
import TaskCard from "./TaskCard";

interface Column {
  id: string;
  label: string;
  filter: (task: Task) => boolean;
}

const columns: Column[] = [
  { id: "backlog", label: "Backlog", filter: (t) => t.status === "backlog" && !t.sprint },
  { id: "sprint1", label: "Sprint 1", filter: (t) => t.sprint === 1 },
  { id: "sprint2", label: "Sprint 2", filter: (t) => t.sprint === 2 },
  { id: "sprint3", label: "Sprint 3", filter: (t) => t.sprint === 3 },
  { id: "done", label: "Done", filter: (t) => t.status === "done" || t.status === "completed" },
];

interface SprintBoardProps {
  tasks: Task[];
}

export default function SprintBoard({ tasks }: SprintBoardProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
        No tasks generated yet. Generate the AI plan first.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((col) => {
          const colTasks = tasks.filter(col.filter);
          return (
            <div key={col.id} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">{col.label}</h3>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-500">
                  {colTasks.length}
                </span>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 min-h-32 flex flex-col gap-2">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-xs text-gray-700">
                    Empty
                  </div>
                ) : (
                  colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
