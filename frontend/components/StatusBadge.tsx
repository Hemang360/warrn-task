import React from "react";

type StatusBadgeProps = {
  status: string;
  size?: "sm" | "md";
};

const STATUS_CONFIG: Record<
  string,
  { label: string; style: string; icon: string }
> = {
  pending: {
    label: "Pending Triage",
    style: "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-500/20",
    icon: "⏳",
  },
  triaged: {
    label: "Triaged by AI",
    style: "bg-blue-500/10 text-blue-400 border-blue-500/30 dark:bg-blue-500/20",
    icon: "🤖",
  },
  needs_review: {
    label: "Needs Human Review",
    style: "bg-orange-500/10 text-orange-400 border-orange-500/30 dark:bg-orange-500/20",
    icon: "👤",
  },
  resolved: {
    label: "Resolved",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20",
    icon: "✅",
  },
  failed: {
    label: "Failed",
    style: "bg-rose-500/10 text-rose-400 border-rose-500/30 dark:bg-rose-500/20",
    icon: "⚠️",
  },
};

const DEFAULT_CONFIG = {
  label: "Unknown",
  style: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  icon: "❓",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    ...DEFAULT_CONFIG,
    label: status,
  };

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1"
      : "px-3 py-1 text-xs font-semibold gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs transition-colors ${sizeClasses} ${config.style}`}
    >
      <span className="text-xs">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}