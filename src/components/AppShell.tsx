import type { ReactNode } from "react";
import { TopNav } from "./BottomNav";
import { cn } from "../lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative min-h-screen overflow-hidden bg-[#2A3140] text-white", className)}
      style={{
        backgroundImage: "url('/reference/quick.png'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.72)_100%)]" />
      <div className="relative">
        <TopNav />
        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
