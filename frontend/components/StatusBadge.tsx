type StatusBadgeProps = {
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  triaged: "bg-blue-100 text-blue-800",
  needs_review: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const DEFAULT_STYLE = "bg-gray-100 text-gray-800";

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}