import type { ReactNode } from "react";

export function PlaceholderImage({
  label,
  icon,
  className = "",
}: {
  label: string;
  icon: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-base-soft text-ink-soft ${className}`}
    >
      <div className="h-12 w-12">{icon}</div>
      <span className="text-caption text-center px-4">{label}</span>
    </div>
  );
}
