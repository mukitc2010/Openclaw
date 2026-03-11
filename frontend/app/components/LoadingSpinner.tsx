export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  return (
    <div
      className={`animate-spin rounded-full border-gray-700 border-t-indigo-500 ${sizeClasses[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
