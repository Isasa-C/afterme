import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, MoreHorizontal, PawPrint, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

type TennisSurface = "Clay" | "Hard" | "Grass" | "Indoor";
type TennisFormat = "Best of 3" | "Best of 5";

const tennisAccent = "#D4546A";
const tennisPhysicalItems = ["Dynamic warm-up (10 min)", "Shadow swings", "Serve warm-up (10 balls)", "Footwork ladder", "Hydrate 500ml"];
const tennisMentalItems = ["Set your intention", "Box breathing 4-4-4", "Recall a strong match", "Pick one tactic", "Accept the nerves"];

function TennisSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/65">{label}</div>
      <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-white/18 bg-white/12 p-1.5 backdrop-blur-[12px]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "min-h-10 rounded-[14px] px-3 text-[12px] font-black text-white/78 transition",
              value === option && "bg-white text-[#2A2020] shadow-[0_14px_30px_-22px_rgba(0,0,0,0.8)]",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TennisChecklistItem({
  label,
  checked,
  accent,
  punching,
  onToggle,
}: {
  label: string;
  checked: boolean;
  accent: string;
  punching: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={cn(
        "relative flex min-h-[44px] items-center gap-2 rounded-[16px] border border-white/18 bg-white/12 px-2.5 py-2 text-left text-white shadow-[0_16px_32px_-28px_rgba(0,0,0,0.75)] backdrop-blur-[10px] transition",
        checked && "border-transparent text-white tile-paw-click",
      )}
      style={checked ? { backgroundColor: accent } : undefined}
    >
      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/55 bg-white/10", checked && "border-white bg-white/20")}>
        {checked ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 text-[12px] font-bold leading-tight">{label}</span>
      {punching ? <PawPrint className="paw-punch pointer-events-none absolute inset-0 m-auto h-9 w-9 text-white" strokeWidth={2.8} /> : null}
    </button>
  );
}

function TennisPreMatchScreen({
  commitmentId,
  activityName,
  reduced,
}: {
  commitmentId?: string;
  activityName?: string;
  reduced: boolean;
}) {
  const navigate = useNavigate();
  const abandon = useAbandonCommitment();
  const markGone = useMarkCommitmentGone();
  const [confirmExit, setConfirmExit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const launchingRef = useRef(false);
  const [warmupStarted, setWarmupStarted] = useState(false);
  const [opponent, setOpponent] = useState("");
  const [surface, setSurface] = useState<TennisSurface>("Clay");
  const [format, setFormat] = useState<TennisFormat>("Best of 3");
  const [tiebreak, setTiebreak] = useState(true);
  const [readyItems, setReadyItems] = useState<Set<string>>(new Set());
  const [pawItem, setPawItem] = useState("");
  const checkedCount = readyItems.size;
  const allReady = checkedCount === tennisPhysicalItems.length + tennisMentalItems.length;
  const title = activityName?.toUpperCase().includes("TENNIS") ? activityName : "Tennis match";

  const matchConfig = {
    opponent: opponent.trim(),
    surface,
    format,
    tiebreak,
  };

  const startMatch = async () => {
    if (!commitmentId || launchingRef.current) return;
    launchingRef.current = true;
    setLaunching(true);
    await markGone.mutateAsync(commitmentId);
    setIsLeaving(true);
    window.setTimeout(
      () =>
        navigate(`/committed/${commitmentId}`, {
          state: { matchConfig },
        }),
      reduced ? 280 : 760,
    );
  };

  useEffect(() => {
    if (warmupStarted && allReady && !launching) {
      void startMatch();
    }
  });

  const toggleReadyItem = (label: string) => {
    setPawItem(label);
    window.setTimeout(() => setPawItem((current) => (current === label ? "" : current)), 520);
    setReadyItems((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const stepAway = async () => {
    if (!commitmentId) return;
    await abandon.mutateAsync(commitmentId);
    navigate("/today");
  };

  return (
    <div
      className={cn("relative min-h-screen overflow-hidden px-5 py-7 text-white", isLeaving && !reduced && "commit-page-fade")}
      style={{
        backgroundImage: "url('/reference/tennis.png'), linear-gradient(160deg, #2D3138 0%, #49343A 48%, #1F2429 100%)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.48)_52%,rgba(0,0,0,0.7)_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col">
        <nav className="flex items-center justify-between">
          <button onClick={() => navigate("/today")} className="text-[28px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            AfterMe
          </button>
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]"
          >
            Out the door
          </button>
        </nav>

        <section className="mt-12 flex flex-1 items-center">
          <div className="w-full rounded-[30px] border border-white/28 bg-white/16 p-4 shadow-[0_28px_70px_-42px_rgba(0,0,0,0.68)] backdrop-blur-[22px]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white" style={{ backgroundColor: tennisAccent }}>
                {title}
              </span>
              <span className="text-[12px] font-semibold text-white/68">{warmupStarted ? "Pre-match checklist" : "Match setup"}</span>
            </div>

            {!warmupStarted ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-white/65">Opponent name</span>
                  <input
                    value={opponent}
                    onChange={(event) => setOpponent(event.target.value)}
                    placeholder="Who are you playing?"
                    className="h-12 w-full rounded-[18px] border border-white/20 bg-white/16 px-4 text-[15px] font-semibold text-white placeholder:text-white/48 outline-none backdrop-blur-[12px] focus:border-white/50"
                  />
                </label>
                <TennisSegmented<TennisSurface> label="Surface" value={surface} options={["Clay", "Hard", "Grass", "Indoor"]} onChange={setSurface} />
                <TennisSegmented<TennisFormat> label="Format" value={format} options={["Best of 3", "Best of 5"]} onChange={setFormat} />
                <div className="flex items-center justify-between rounded-[18px] border border-white/18 bg-white/12 px-3 py-3 backdrop-blur-[12px]">
                  <span className="text-[13px] font-black text-white">Tiebreak at 6-6</span>
                  <button
                    type="button"
                    onClick={() => setTiebreak((value) => !value)}
                    className="flex h-9 w-[88px] items-center rounded-full border border-white/20 bg-white/14 p-1 transition"
                    aria-pressed={tiebreak}
                  >
                    <span
                      className="grid h-7 w-10 place-items-center rounded-full text-[11px] font-black text-white shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)] transition"
                      style={{ transform: tiebreak ? "translateX(38px)" : "translateX(0)", backgroundColor: tiebreak ? tennisAccent : "rgba(255,255,255,0.24)" }}
                    >
                      {tiebreak ? "Yes" : "No"}
                    </span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setWarmupStarted(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-[15px] font-black text-white shadow-[0_18px_36px_-18px_rgba(212,84,106,0.88)] transition active:scale-[0.99]"
                  style={{ backgroundColor: tennisAccent }}
                >
                  Start warm-up
                  <ArrowRight className="h-4 w-4" strokeWidth={2.7} />
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-2 rounded-full bg-[#FAC775]/18 px-3 py-1 text-center text-[11px] font-black uppercase tracking-[0.1em] text-[#FAC775]">Physical</div>
                    <div className="space-y-2">
                      {tennisPhysicalItems.map((item) => (
                        <TennisChecklistItem key={item} label={item} checked={readyItems.has(item)} accent={tennisAccent} punching={pawItem === item} onToggle={() => toggleReadyItem(item)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 rounded-full bg-[#A98BFF]/18 px-3 py-1 text-center text-[11px] font-black uppercase tracking-[0.1em] text-[#C8B9FF]">Mental</div>
                    <div className="space-y-2">
                      {tennisMentalItems.map((item) => (
                        <TennisChecklistItem key={item} label={item} checked={readyItems.has(item)} accent={tennisAccent} punching={pawItem === item} onToggle={() => toggleReadyItem(item)} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-[12px] font-bold text-white/70">{checkedCount} of 10 ready</div>
                <button
                  type="button"
                  onClick={startMatch}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-[15px] font-black text-white shadow-[0_18px_36px_-18px_rgba(212,84,106,0.88)] transition active:scale-[0.99]"
                  style={{ backgroundColor: tennisAccent }}
                >
                  I'm ready
                  <ArrowRight className="h-4 w-4" strokeWidth={2.7} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {confirmExit ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2A2020]/25 px-5 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[28px] border border-white/70 bg-white/92 p-6 text-[#2A2020] shadow-[0_30px_80px_-40px_rgba(8,13,47,0.5)]">
            <h2 className="text-2xl font-black">Step away from this?</h2>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-[#8A675D]">Your pre-match setup can wait until you are ready.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={stepAway} className="rounded-[18px] border border-[#FFD2BD] bg-white/70 px-4 py-3 font-black text-[#8A675D]">Step away</button>
              <button onClick={() => setConfirmExit(false)} className="rounded-[18px] px-4 py-3 font-black text-white" style={{ backgroundColor: tennisAccent }}>Keep going</button>
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
  const activityText = `${activity?.id ?? ""} ${activity?.key ?? ""} ${activity?.name ?? ""}`.toLowerCase();
  const isTennis = activityText.includes("tennis");

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

  if (isTennis) {
    return <TennisPreMatchScreen commitmentId={id} activityName={activity?.name} reduced={reduced} />;
  }

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
