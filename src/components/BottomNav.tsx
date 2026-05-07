import { CalendarDays, Home, Plus, UserRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export const navItems = [
  { to: "/today", label: "Today", icon: Home },
  { to: "/history", label: "Calendar", icon: CalendarDays },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function TopNav() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/10 px-4 py-2 shadow-[0_14px_34px_-32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-3">
        <button onClick={() => navigate("/today")} className="grid h-9 w-9 place-items-center rounded-[12px] border border-white/20 bg-white/15 text-white shadow-md backdrop-blur-xl" aria-label="AfterMe home">
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => navigate("/today")} className="text-[22px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }} aria-label="AfterMe home">
          AfterMe
        </button>
        <div className="flex-1" />
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <TopNavLink key={item.label} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SideNav() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[320px] shrink-0 flex-col border-r border-white/70 bg-[#FFF7EF]/84 px-7 py-9 shadow-[18px_0_55px_-38px_rgba(127,72,44,0.24)] backdrop-blur-xl lg:flex">
      <div className="flex h-full flex-col">
        <NavLink to="/today" className="mb-9 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br from-[#FF8066] to-[#FFB15F] text-white shadow-lg shadow-orange-300/30">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-[28px] font-bold leading-none text-[#2A2020]">AfterMe</span>
        </NavLink>

        <nav className="space-y-4">
          <NavLink
            to="/today"
            className={({ isActive }) =>
              cn(
                "flex h-[50px] items-center gap-4 rounded-[16px] px-5 text-[16px] font-bold text-[#8A675D] transition hover:bg-white/70 hover:text-[#C55235]",
                isActive && "bg-[#FFF0E7] text-[#F06445] shadow-sm",
              )
            }
          >
            <Home className="h-6 w-6" strokeWidth={2.3} />
            Today
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              cn(
                "flex h-[50px] items-center gap-4 rounded-[16px] px-5 text-[16px] font-bold text-[#8A675D] transition hover:bg-white/70 hover:text-[#2FA66F]",
                isActive && "bg-[#EAF8EF] text-[#2FA66F] shadow-sm",
              )
            }
          >
            <CalendarDays className="h-6 w-6" strokeWidth={2.3} />
            Calendar
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex h-[50px] items-center gap-4 rounded-[16px] px-5 text-[16px] font-bold text-[#8A675D] transition hover:bg-white/70 hover:text-[#D65C8A]",
                isActive && "bg-[#FFEAF2] text-[#D65C8A] shadow-sm",
              )
            }
          >
            <UserRound className="h-6 w-6" strokeWidth={2.3} />
            Profile
          </NavLink>
        </nav>

        <div className="mt-auto rounded-[24px] border border-white/70 bg-[#FFF2E6]/74 p-5 text-[14px] leading-[1.45] text-[#8A675D] shadow-[0_18px_42px_-34px_rgba(127,72,44,0.25)]">
          <div className="mb-3 font-bold text-[#2A2020]">Future you has receipts.</div>
          Every reflection makes the next start a little easier.
        </div>
      </div>
    </aside>
  );
}

function TopNavLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex h-9 items-center gap-2 rounded-full border border-white/10 px-2.5 text-[13px] font-semibold text-white/72 transition hover:bg-white/15 hover:text-white",
          isActive && "border-white/50 bg-white/85 text-[#1A1A1C] shadow-sm",
        )
      }
      aria-label={label}
      title={label}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}
