import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  PawPrint,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemIcon } from "../components/ItemIcon";
import { useActivities, useActivityItems, useMarkCommitmentGone, useStartPackingCommitment } from "../hooks/useAfterMeData";
import type { ActivityItem } from "../lib/types";
import { cn } from "../lib/utils";

const activityBackgrounds: Record<string, string> = {
  gym: "/reference/gym.png",
  focus: "/reference/study.png",
  swimming: "/reference/swimming.png",
  outside: "/reference/quick.png",
  social: "/reference/reach-out.png",
};

const tabColorMap: Record<string, string> = {
  gym: "#9D5BFF",
  focus: "#E8A838",
  swimming: "#2A82C4",
  outside: "#4A9E6B",
  social: "#D4546A",
};

function timeValueAfter(minutes: number) {
  const date = new Date(Date.now() + minutes * 60 * 1000);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function nextReminderDate(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function reminderLabel(date: Date) {
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  return isTomorrow ? `${time} tomorrow` : time;
}

function ChecklistTile({
  item,
  checked,
  optional,
  punching,
  accentColor,
  onClick,
}: {
  item: ActivityItem;
  checked: boolean;
  optional?: boolean;
  punching: boolean;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={item.label}
      aria-pressed={checked}
      className={cn(
        "relative grid min-h-[74px] place-items-center gap-1 rounded-[14px] border px-1.5 py-2 transition",
        "border-[rgba(42,49,64,0.15)] bg-white/60",
        optional && "border-dashed opacity-70",
        checked && "border-solid opacity-100",
        punching && "tile-paw-click",
      )}
      style={{
        borderWidth: "0.5px",
        background: checked ? accentColor : undefined,
        borderColor: checked ? accentColor : undefined,
        boxShadow: checked ? undefined : "inset 0 1px 0 rgba(255,255,255,0.5)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <ItemIcon
        iconKey={item.icon_key}
        className={cn(
          "h-8 w-8 rounded-[10px] bg-transparent text-[#5A6175] shadow-none",
          checked && "bg-white/20 text-white",
        )}
      />
      <span className={cn("line-clamp-2 max-w-full text-center text-[10px] font-bold leading-[1.1] text-[#5A6175]", checked && "text-white")}>
        {item.label}
      </span>
      {checked ? (
        <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white" style={{ color: accentColor, transition: "color 0.3s ease" }}>
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      ) : null}
      {punching ? <PawPrint className="paw-punch pointer-events-none absolute inset-0 m-auto h-10 w-10" style={{ color: accentColor }} strokeWidth={2.8} /> : null}
    </button>
  );
}

export function Today() {
  const navigate = useNavigate();
  const { data: activities = [] } = useActivities();
  const startPacking = useStartPackingCommitment();
  const markGone = useMarkCommitmentGone();
  const [selectedId, setSelectedId] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [pawItemId, setPawItemId] = useState("");
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindAt, setRemindAt] = useState(() => timeValueAfter(15));
  const [reminderNotice, setReminderNotice] = useState("");
  const [catRunning, setCatRunning] = useState(false);
  const reminderTimerRef = useRef<number | null>(null);
  const selected = useMemo(() => activities.find((activity) => activity.id === selectedId) ?? activities[0], [activities, selectedId]);
  const { data: activityItems = [] } = useActivityItems(selected?.id);
  const mustItems = useMemo(() => activityItems.filter((item) => item.priority === "must"), [activityItems]);
  const optionalItems = useMemo(() => activityItems.filter((item) => item.priority === "optional"), [activityItems]);
  const checkedMust = mustItems.filter((item) => checkedItems.has(item.id)).length;
  const ready = mustItems.length > 0 && checkedMust === mustItems.length;
  const progress = mustItems.length ? (checkedMust / mustItems.length) * 100 : 0;
  const accentColor = selected?.color ?? tabColorMap[selected?.id ?? ""] ?? tabColorMap[selected?.key ?? "gym"] ?? tabColorMap.gym;
  const backgroundImage =
    activityBackgrounds[selected?.id ?? ""] ?? activityBackgrounds[selected?.key ?? ""] ?? activityBackgrounds.gym;

  useEffect(() => {
    setCheckedItems(new Set());
    setPawItemId("");
  }, [selected?.id]);

  useEffect(() => {
    if (!activities.length) return;
    if (!selectedId || !activities.some((activity) => activity.id === selectedId)) {
      setSelectedId(activities[0].id);
    }
  }, [activities, selectedId]);

  useEffect(() => {
    return () => {
      if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current);
    };
  }, []);

  const toggleItem = (itemId: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) next.delete(itemId);
      else {
        next.add(itemId);
        setPawItemId(itemId);
        window.setTimeout(() => setPawItemId((currentId) => (currentId === itemId ? "" : currentId)), 560);
      }
      return next;
    });
  };

  const goDirectly = async () => {
    if (!ready || !selected || catRunning) return;
    setCatRunning(true);
    const [commitment] = await Promise.all([
      startPacking.mutateAsync({ activityId: selected.id, minimumMinutes: selected.default_duration_min }),
      new Promise((resolve) => window.setTimeout(resolve, 980)),
    ]);
    await markGone.mutateAsync(commitment.id);
    navigate(`/committed/${commitment.id}`);
  };

  const openReminder = () => {
    setRemindAt(timeValueAfter(15));
    setRemindOpen(true);
  };

  const saveReminder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const reminderDate = nextReminderDate(remindAt);
    if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current);
    reminderTimerRef.current = window.setTimeout(() => {
      alert(`Reminder: future you still gets a vote on ${selected.name}.`);
      setReminderNotice("");
    }, reminderDate.getTime() - Date.now());
    setReminderNotice(`Reminder set for ${reminderLabel(reminderDate)}.`);
    setRemindOpen(false);
  };

  const setActiveTab = (tab: string) => {
    setSelectedId(tab);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundImage: `url('${backgroundImage}'), linear-gradient(160deg, #2A3140 0%, #3D4252 35%, #5A4A52 70%, #2D2A2F 100%)`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 pb-5 pt-4">
        <h2 className="sr-only">AfterMe checklist screen for packing essentials before heading out.</h2>

        <nav className="flex items-center justify-between">
          <div className="text-[28px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            AfterMe
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-full bg-white px-5 py-2 text-[14px] font-medium text-[#1A1A1C] shadow-sm">
              Ready?
            </button>
            <button
              type="button"
              onClick={() => navigate("/history")}
              aria-label="Open calendar"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/15 text-white"
              style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            >
              <CalendarDays className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              aria-label="Open profile"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/15 text-white"
              style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            >
              <UserRound className="h-5 w-5" />
            </button>
          </div>
        </nav>

        {reminderNotice ? (
          <div className="mt-4 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-center text-[12px] font-medium text-white" style={{ backdropFilter: "blur(10px)" }}>
            {reminderNotice}
          </div>
        ) : null}

        <section className="mt-20 flex min-h-[260px] flex-col justify-center">
          <div className="mx-auto max-w-[320px] text-center">
            <div
              className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255,255,255,0.25)",
                borderWidth: "0.5px",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Do this for future you
            </div>
            <h1
              className="text-[38px] leading-[1.5] text-white"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400, textShadow: "0 1px 12px rgba(0,0,0,0.3)" }}
            >
              Grab your <em style={{ color: accentColor, fontStyle: "italic", fontWeight: 600, transition: "color 0.3s ease" }}>essentials</em> & step out{" "}
              <em style={{ color: accentColor, fontStyle: "italic", fontWeight: 600, transition: "color 0.3s ease" }}>lighter</em>.
            </h1>
          </div>

          <div className="mt-7 flex justify-center gap-2 overflow-x-auto pb-1" aria-label="Choose activity">
            {activities.map((activity) => {
              const active = selected?.id === activity.id;
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => setActiveTab(activity.id)}
                  className={cn("shrink-0 rounded-full border py-[7px] text-[13px]", active ? "px-4 font-semibold" : "px-3.5")}
                  style={{
                    background: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderColor: active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                    borderWidth: "0.5px",
                    color: active ? accentColor : "rgba(255,255,255,0.8)",
                    transition: "background 0.3s ease, color 0.3s ease",
                  }}
                >
                  {activity.name}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="mx-[14px] mt-6 rounded-[18px] border px-4 pb-[18px] pt-[22px] text-[#2A3140] shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderColor: "rgba(255,255,255,0.45)",
            borderWidth: "0.5px",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-[1.2px]" style={{ color: accentColor, transition: "color 0.3s ease" }}>Must have</div>
            <div className="text-[11px] text-gray-500">{checkedMust} of {mustItems.length}</div>
          </div>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-[#E6E7EB]">
            <div className="h-full rounded-full transition-all duration-300" style={{ background: accentColor, transition: "background 0.3s ease, width 0.3s ease", width: `${progress}%` }} />
          </div>
          <div className="mt-[14px] grid grid-cols-3 gap-[7px]">
            {mustItems.map((item) => (
              <ChecklistTile
                key={item.id}
                item={item}
                checked={checkedItems.has(item.id)}
                punching={pawItemId === item.id}
                accentColor={accentColor}
                onClick={() => toggleItem(item.id)}
              />
            ))}
          </div>

          <div className="mt-[18px] border-t border-dashed border-[#B5AB95]/70 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[1.2px] text-[#8A8676]">Optional</div>
              <div className="text-[11px] text-[#B5AB95]">Skip if not today</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-[7px]">
              {optionalItems.map((item) => (
                <ChecklistTile
                  key={item.id}
                  item={item}
                  checked={checkedItems.has(item.id)}
                  optional
                  punching={pawItemId === item.id}
                  accentColor={accentColor}
                  onClick={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 border-t pt-3.5" style={{ borderColor: "rgba(0,0,0,0.08)", borderTopWidth: "0.5px" }}>
            <button
              type="button"
              onClick={goDirectly}
              disabled={!ready || catRunning}
              className="flex w-full items-center justify-center gap-2 rounded-full p-[13px] text-[14px] font-medium text-white"
              style={{ background: accentColor, opacity: !ready || catRunning ? 0.62 : 1, transition: "background 0.3s ease, opacity 0.2s ease" }}
            >
              Ready
              <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={openReminder} className="mt-2.5 block w-full text-center text-[12px] text-[rgba(0,0,0,0.35)] no-underline">
              Remind me later
            </button>
          </div>
        </section>
      </main>

      {remindOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-5 backdrop-blur-sm" onClick={() => setRemindOpen(false)}>
          <form
            className="mx-[14px] w-full max-w-[400px] rounded-[28px] border p-5 text-[#1A1A1C] shadow-[0_-18px_46px_rgba(0,0,0,0.24)]"
            style={{
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              borderColor: "rgba(255,255,255,0.45)",
            }}
            onSubmit={saveReminder}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/10" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Set reminder</h2>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-white/60 bg-white/45 text-gray-600" aria-label="Close reminder" onClick={() => setRemindOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-5 text-sm font-semibold leading-6 text-gray-500">Choose when to remind you about {selected.name}.</p>
            <label className="block text-sm font-bold">
              Remind me at
              <input
                type="time"
                value={remindAt}
                onChange={(event) => setRemindAt(event.target.value)}
                className="theme-time-input mt-2 h-14 w-full rounded-2xl border px-4 text-lg font-bold outline-none"
                style={{
                  accentColor,
                  background: "rgba(255,255,255,0.45)",
                  borderColor: "rgba(255,255,255,0.6)",
                  color: "#1A1A1C",
                  colorScheme: "light",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              />
            </label>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[15, 30, 60].map((minutes) => (
                <button key={minutes} type="button" onClick={() => setRemindAt(timeValueAfter(minutes))} className="h-11 rounded-2xl border border-white/60 bg-white/45 text-sm font-bold text-[#2A3140]">
                  {minutes} min
                </button>
              ))}
            </div>
            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold text-white" style={{ background: accentColor }}>
              <Clock3 className="h-5 w-5" />
              Set reminder
            </button>
            <button type="button" className="mt-4 w-full text-center text-sm font-bold text-gray-500" onClick={() => setRemindOpen(false)}>
              Cancel
            </button>
          </form>
        </div>
      ) : null}

      {catRunning ? (
        <div className="cat-run-overlay" aria-hidden="true">
          <div className="running-cat">
            <span className="cat-tail" />
            <span className="cat-body" />
            <span className="cat-head">
              <span className="cat-ear cat-ear-left" />
              <span className="cat-ear cat-ear-right" />
              <span className="cat-eye" />
            </span>
            <span className="cat-collar" style={{ background: accentColor }} />
            <span className="cat-leg cat-leg-front" />
            <span className="cat-leg cat-leg-back" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
