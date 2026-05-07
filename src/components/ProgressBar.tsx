import { cn } from "../lib/utils";

const colors = {
  gym: "bg-activity-gym",
  focus: "bg-activity-focus",
  outside: "bg-activity-outside",
  social: "bg-activity-social",
  custom: "bg-brand-500",
};

export function ProgressBar({ value, colorKey = "gym", className }: { value: number; colorKey?: keyof typeof colors; className?: string }) {
  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-slate-200", className)} aria-label={`${value}%`}>
      <div className={cn("h-full rounded-full", colors[colorKey])} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
