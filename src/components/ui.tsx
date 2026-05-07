import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

export function Card({ children, className, padding = "p-5" }: { children: ReactNode; className?: string; padding?: string }) {
  return <section className={cn("glass-card rounded-card shadow-soft", padding, className)}>{children}</section>;
}

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="font-serif text-[20px] font-semibold leading-[1.2] text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.3)]">{title}</h2>
      {actionLabel ? (
        <button className="font-semibold text-white/80" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("glass-card grid h-12 w-12 place-items-center rounded-full text-ink shadow-soft", className)}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-2xl", className)} />;
}
