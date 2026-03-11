type Status = "pending" | "running" | "completed" | "failed" | "draft" | "active" | string;

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-gray-800 text-gray-300 border border-gray-700" },
  running: { label: "Running", classes: "bg-blue-950 text-blue-300 border border-blue-800" },
  completed: { label: "Completed", classes: "bg-emerald-950 text-emerald-300 border border-emerald-800" },
  failed: { label: "Failed", classes: "bg-red-950 text-red-300 border border-red-800" },
  draft: { label: "Draft", classes: "bg-gray-800 text-gray-300 border border-gray-700" },
  active: { label: "Active", classes: "bg-indigo-950 text-indigo-300 border border-indigo-800" },
  backlog: { label: "Backlog", classes: "bg-gray-800 text-gray-400 border border-gray-700" },
  done: { label: "Done", classes: "bg-emerald-950 text-emerald-300 border border-emerald-800" },
  high: { label: "High", classes: "bg-red-950 text-red-300 border border-red-800" },
  medium: { label: "Medium", classes: "bg-amber-950 text-amber-300 border border-amber-800" },
  low: { label: "Low", classes: "bg-gray-800 text-gray-400 border border-gray-700" },
};

interface StatusBadgeProps {
  status: Status;
  pulse?: boolean;
}

export default function StatusBadge({ status, pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] ?? {
    label: status,
    classes: "bg-gray-800 text-gray-300 border border-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}
    >
      {pulse && status === "running" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
        </span>
      )}
      {config.label}
    </span>
  );
}
