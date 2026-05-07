import type { ReflectionOutcome } from "../lib/types";
import { cn } from "../lib/utils";

const outcomeStyles = {
  better: "bg-green-100 text-green-700",
  same: "bg-amber-100 text-amber-700",
  worse: "bg-red-100 text-red-600",
};

const labels = {
  better: "Better",
  same: "Same",
  worse: "Worse",
};

const faces = {
  better: ":)",
  same: ":|",
  worse: ":(",
};

export function OutcomePill({ outcome }: { outcome: ReflectionOutcome }) {
  return (
    <span className={cn("inline-flex min-w-24 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold", outcomeStyles[outcome])}>
      {outcome === "better" ? <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.55)]" aria-hidden="true" /> : null}
      <span>{faces[outcome]}</span>
      {labels[outcome]}
    </span>
  );
}
