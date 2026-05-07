import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export function StatTile({
  icon,
  number,
  label,
  subLabel,
  color = "text-brand-600",
  className,
}: {
  icon: ReactNode;
  number: ReactNode;
  label: string;
  subLabel?: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col items-center justify-start gap-1 px-2 py-3 text-center", className)}>
      <div className={cn("mb-1 grid h-11 w-11 place-items-center rounded-full bg-current/10", color)}>{icon}</div>
      <div className={cn("text-3xl font-semibold leading-none", color)}>{number}</div>
      <div className="text-sm font-semibold leading-tight text-ink">{label}</div>
      {subLabel ? <div className="text-xs leading-tight text-slate-500">{subLabel}</div> : null}
    </div>
  );
}
