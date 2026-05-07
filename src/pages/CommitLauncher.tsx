import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, MoreHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { ItemIcon } from "../components/ItemIcon";
import { packCopy } from "../copy/pack";
import {
  useAbandonCommitment,
  useActivities,
  useActivityItems,
  useCommitment,
  useMarkCommitmentGone,
} from "../hooks/useAfterMeData";
import type { ActivityItem } from "../lib/types";
import { cn } from "../lib/utils";

function formatClock(seconds: number) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const listener = () => setReduced(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);
  return reduced;
}

const launcherMood: Record<string, { subtitle: string; future: string; tint: string; glow: string }> = {
  gym: {
    subtitle: "Let's get stronger today.",
    future: "You'll feel proud after showing up.",
    tint: "from-[#FFF4EC] via-white to-[#FFE4D6]",
    glow: "rgba(255, 128, 102, 0.24)",
  },
  focus: {
    subtitle: "Focus today, future you will thank you.",
    future: "You'll feel accomplished after a focused session.",
    tint: "from-[#FFFBEF] via-white to-[#EAF8EF]",
    glow: "rgba(84, 151, 108, 0.2)",
  },
  outside: {
    subtitle: "Step out, reset, come back refreshed.",
    future: "You'll feel better after a quick break.",
    tint: "from-[#FFF8E7] via-white to-[#FFE9BE]",
    glow: "rgba(255, 177, 95, 0.24)",
  },
  social: {
    subtitle: "A small message can brighten someone's day.",
    future: "You'll feel connected after reaching out.",
    tint: "from-[#FFF2F7] via-white to-[#FFE4EF]",
    glow: "rgba(214, 92, 138, 0.22)",
  },
  swimming: {
    subtitle: "Move your body, clear your mind.",
    future: "You'll feel refreshed after a swim.",
    tint: "from-[#ECFBFF] via-white to-[#DDF7F6]",
    glow: "rgba(56, 189, 248, 0.22)",
  },
  custom: {
    subtitle: "One small start is enough.",
    future: "You'll feel lighter after beginning.",
    tint: "from-[#FFF7EF] via-white to-[#F3F8E8]",
    glow: "rgba(255, 184, 107, 0.2)",
  },
};

function ChecklistRow({
  item,
  checked,
  optional,
  onToggle,
}: {
  item: ActivityItem;
  checked: boolean;
  optional?: boolean;
  onToggle: () => void;
}) {
  if (optional) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "flex min-h-[52px] min-w-[148px] flex-1 items-center gap-2 rounded-[18px] border border-white/70 bg-white/54 px-2.5 py-2 text-left shadow-[0_16px_38px_-34px_rgba(127,72,44,0.32)] transition hover:-translate-y-0.5 hover:bg-white/78",
          checked && "bg-[#FBFAFF] ring-2 ring-[#FF9F7A]/50",
        )}
        aria-pressed={checked}
      >
        <ItemIcon iconKey={item.icon_key} className={cn("h-8 w-8 rounded-[12px]", checked && "bg-[#FFE8DC] text-[#F06445]")} />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate text-[13px] font-black leading-tight text-[#2A2020]", checked && "text-[#F06445]")}>{item.label}</span>
        </span>
        <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#FFD2BD] bg-white/66 text-[14px] font-bold text-[#8A675D]", checked && "border-[#F06445] bg-[#F06445] text-white")}>
          {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : "+"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className={cn(
        "group flex min-h-[58px] min-w-[168px] flex-1 items-center gap-2.5 rounded-[20px] border border-white/72 bg-white/72 px-3 py-2.5 text-left shadow-[0_18px_44px_-34px_rgba(127,72,44,0.36)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/90",
        checked && "bg-[#FBFAFF] shadow-[0_22px_48px_-34px_rgba(249,115,91,0.42)] ring-2 ring-[#FF9F7A]/60",
      )}
      aria-pressed={checked}
    >
      <ItemIcon iconKey={item.icon_key} className={cn("h-9 w-9 rounded-[13px]", checked && "bg-[#FFE8DC] text-[#F06445]")} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-black leading-tight text-[#2A2020]">{item.label}</span>
      </span>
      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[#FFD2BD] bg-white/70 text-transparent transition", checked && "border-[#F06445] bg-[#F06445] text-white shadow-[0_12px_24px_-12px_rgba(249,115,91,0.75)]")}>
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

export function CommitLauncher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commitment } = useCommitment(id);
  const { data: activities = [] } = useActivities();
  const activity = activities.find((row) => row.id === commitment?.activity_id);
  const { data: items = [] } = useActivityItems(activity?.id);
  const abandon = useAbandonCommitment();
  const markGone = useMarkCommitmentGone();
  const reduced = useReducedMotion();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(Date.now());
  const [confirmExit, setConfirmExit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const mustItems = items.filter((item) => item.priority === "must");
  const optionalItems = items.filter((item) => item.priority === "optional");
  const checkedMust = mustItems.filter((item) => checked.has(item.id)).length;
  const remainingMust = Math.max(0, mustItems.length - checkedMust);
  const ready = mustItems.length > 0 && remainingMust === 0;
  const copy = packCopy[activity?.key ?? "custom"];
  const mood = (activity && (launcherMood[activity.id] ?? launcherMood[activity.key])) ?? launcherMood.custom;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsed = commitment ? Math.max(0, Math.floor((now - +new Date(commitment.started_at)) / 1000)) : 0;
  const remainingSeconds = Math.max(0, (commitment?.minimum_minutes ?? 10) * 60 - elapsed);
  const progress = mustItems.length ? (checkedMust / mustItems.length) * 100 : 0;
  const progressLabel = `${checkedMust}/${mustItems.length}`;
  const essentialsLabel = `${remainingMust} must-have${remainingMust === 1 ? "" : "s"}`;
  const ctaLabel = ready ? "Ready to go" : `Grab ${essentialsLabel}`;

  const nextMust = useMemo(() => mustItems.find((item) => !checked.has(item.id)), [checked, mustItems]);

  const toggleItem = (item: ActivityItem) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const go = async () => {
    if (!ready || !id) return;
    await markGone.mutateAsync(id);
    setIsLeaving(true);
    window.setTimeout(() => navigate(`/committed/${id}`), reduced ? 300 : 950);
  };

  const stepAway = async () => {
    if (!id) return;
    await abandon.mutateAsync(id);
    navigate("/today");
  };

  return (
    <div className={cn("min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,rgba(255,196,150,0.44),transparent_34%),radial-gradient(circle_at_92%_0%,rgba(255,143,128,0.26),transparent_34%),radial-gradient(circle_at_70%_108%,rgba(101,216,187,0.2),transparent_36%),linear-gradient(135deg,#fffaf5_0%,#fff3ea_48%,#f7fbf3_100%)] text-[#2A2020]", isLeaving && !reduced && "commit-page-fade")}>
      <main className="mx-auto min-h-screen w-full max-w-xl px-4 pb-32 pt-5">
        <header className="mb-4 flex items-center gap-3">
          <button onClick={() => setConfirmExit(true)} className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white/76 text-[#2A2020] shadow-[0_16px_36px_-28px_rgba(127,72,44,0.42)] backdrop-blur-xl transition hover:bg-white" aria-label="Abandon commitment">
            <ArrowLeft className="h-6 w-6" strokeWidth={2.6} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {activity ? <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} className="h-9 w-9 rounded-[13px]" /> : null}
              <h1 className="truncate text-[29px] font-black leading-none text-[#2A2020]">{activity?.name ?? copy.headline}</h1>
            </div>
            <p className="mt-1 truncate text-[15px] font-semibold text-[#8A675D]">{mood.subtitle}</p>
          </div>
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] bg-white/76 text-[#2A2020] shadow-[0_16px_36px_-28px_rgba(127,72,44,0.42)] backdrop-blur-xl transition hover:bg-white" aria-label="More options">
            <MoreHorizontal className="h-6 w-6" strokeWidth={2.6} />
          </button>
        </header>

        <section className={cn("relative mb-4 min-h-[216px] overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-br p-5 shadow-[0_28px_70px_-48px_rgba(127,72,44,0.48)] backdrop-blur-2xl", mood.tint)}>
          <div className="absolute right-[-42px] top-[-42px] h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: mood.glow }} />
          {activity ? (
            <div className="absolute -right-7 bottom-[-30px] grid h-48 w-48 rotate-[-8deg] place-items-center rounded-[48px] border border-white/70 bg-white/42 shadow-[0_28px_70px_-46px_rgba(127,72,44,0.5)] backdrop-blur-xl">
              <div className="grid h-32 w-32 place-items-center rounded-[38px] bg-white/54 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} className="h-[88px] w-[88px] rounded-[28px] opacity-90" />
              </div>
            </div>
          ) : null}
          <div className="relative max-w-[72%]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/66 px-3 py-1.5 text-[13px] font-black text-[#F06445] shadow-sm">
              <Sparkles className="h-4 w-4" strokeWidth={2.6} />
              Future you
            </div>
            <h2 className="text-[29px] font-black leading-[1.12] text-[#2A2020]">{mood.future}</h2>
          </div>
        </section>

        <section className="mb-4 flex items-center gap-4 rounded-[28px] border border-white/72 bg-white/64 p-4 shadow-[0_24px_58px_-46px_rgba(127,72,44,0.42)] backdrop-blur-2xl">
          <div
            className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full p-2"
            style={{ background: `conic-gradient(#F06445 ${progress}%, rgba(216,222,232,0.72) ${progress}% 100%)` }}
            aria-label={`${progressLabel} must-haves complete`}
          >
            <div className="grid h-full w-full place-items-center rounded-full bg-white/92 text-[20px] font-black text-[#2A2020] shadow-inner">{progressLabel}</div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[20px] font-black leading-tight text-[#2A2020]">{ready ? "Ready when you are" : "Almost ready"}</h2>
            <p className="mt-1 text-[15px] font-semibold text-[#8A675D]">{ready ? copy.subline : `${essentialsLabel} left`}</p>
            <div className="mt-3 flex items-center gap-2 text-[13px] font-bold text-[#8A675D]">
              <Clock3 className="h-4 w-4" strokeWidth={2.4} />
              {formatClock(remainingSeconds)}
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-white/70 bg-white/46 p-3 shadow-[0_24px_58px_-48px_rgba(127,72,44,0.38)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-[13px] font-black uppercase tracking-[0.08em] text-[#2A2020]">Must have</h2>
            <span className={cn("rounded-full px-3 py-1 text-xs font-black", ready ? "bg-[#F06445] text-white" : "bg-white/72 text-[#8A675D]")}>{progressLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mustItems.map((item) => (
              <ChecklistRow key={item.id} item={item} checked={checked.has(item.id)} onToggle={() => toggleItem(item)} />
            ))}
          </div>
        </section>

        {optionalItems.length ? (
          <section className="rounded-[30px] border border-white/70 bg-white/34 p-3 shadow-[0_18px_48px_-44px_rgba(127,72,44,0.32)] backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[12px] font-black uppercase tracking-[0.08em] text-[#8A675D]">Optional</h2>
              <span className="text-[13px] font-bold text-[#8A675D]">Skip if not today</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {optionalItems.map((item) => (
                <ChecklistRow key={item.id} item={item} checked={checked.has(item.id)} optional onToggle={() => toggleItem(item)} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-xl bg-gradient-to-t from-white via-white/92 to-white/0 px-4 pb-4 pt-8 backdrop-blur-sm">
        <button
          onClick={go}
          aria-disabled={!ready}
          className={cn(
            "flex h-16 w-full items-center justify-between rounded-[24px] bg-gradient-to-r from-[#FF8066] via-[#F06445] to-[#FFB15F] px-6 text-[20px] font-black text-white shadow-[0_24px_48px_-18px_rgba(249,115,91,0.72)] transition hover:-translate-y-0.5 active:translate-y-0",
            ready && "go-ready",
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {ready ? <CheckCircle2 className="h-6 w-6 shrink-0" strokeWidth={2.6} /> : null}
            <span className="truncate">{ctaLabel}</span>
          </span>
          <ArrowRight className="h-6 w-6 shrink-0" strokeWidth={2.6} />
        </button>
        {!ready && nextMust ? <p className="mt-2 text-center text-[13px] font-bold text-[#8A675D]">Next: {nextMust.label}</p> : null}
      </footer>

      {isLeaving ? <SoftLeaveOverlay reduced={reduced} /> : null}

      {confirmExit ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2A2020]/25 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_30px_80px_-40px_rgba(8,13,47,0.5)]">
            <h2 className="text-2xl font-black text-[#2A2020]">Step away from this?</h2>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#8A675D]">Your checklist stays simple. You can come back whenever you are ready.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={stepAway} className="rounded-[18px] border border-[#FFD2BD] bg-white/70 px-4 py-3 font-black text-[#8A675D]">Step away</button>
              <button onClick={() => setConfirmExit(false)} className="rounded-[18px] bg-[#C55235] px-4 py-3 font-black text-white">Keep going</button>
            </div>
            <button type="button" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-[#8A675D]" aria-label="Close dialog" onClick={() => setConfirmExit(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SoftLeaveOverlay({ reduced }: { reduced: boolean }) {
  return (
    <div className={cn("fixed inset-0 z-50 bg-[radial-gradient(circle_at_50%_42%,rgba(249,115,91,0.22),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.74),rgba(241,245,250,0.92))]", !reduced && "soft-leave")} />
  );
}
