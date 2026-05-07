import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpDown,
  Circle,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Pause,
  PawPrint,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useActivities, useCommitment } from "../hooks/useAfterMeData";
import { cn } from "../lib/utils";

const activityBackgrounds: Record<string, string> = {
  gym: "/reference/gym.png",
  focus: "/reference/study.png",
  swimming: "/reference/swimming.png",
  outside: "/reference/quick.png",
  social: "/reference/reach-out.png",
};

const activityAccents: Record<string, string> = {
  gym: "#9D5BFF",
  focus: "#E8A838",
  swimming: "#2A82C4",
  outside: "#4A9E6B",
  social: "#D4546A",
};

function formatClock(seconds: number) {
  const minutes = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

const gymGreen = "rgba(74, 140, 92, 0.85)";
type MuscleGroup = {
  id: string;
  label: string;
  icon: string;
  recovery: number;
  conflicts: string[];
  warns: string[];
  exercises: string[];
};

type ExerciseLog = Record<string, Record<string, string[]>>;
type WarningPrompt = { groupId: string; message: string } | null;
type ShoppingItem = { id: string; text: string; checked: boolean };

const muscleGroups: MuscleGroup[] = [
  {
    id: "hip",
    label: "Hip",
    icon: "ti-rotate",
    recovery: 72,
    conflicts: ["back"],
    warns: ["legs"],
    exercises: ["Hip thrust", "Glute bridge", "Cable kickback", "Romanian deadlift"],
  },
  {
    id: "back",
    label: "Back",
    icon: "ti-arrows-vertical",
    recovery: 72,
    conflicts: ["hip"],
    warns: [],
    exercises: ["Lat pulldown", "Seated row", "Deadlift", "Face pull"],
  },
  {
    id: "legs",
    label: "Legs",
    icon: "ti-run",
    recovery: 48,
    conflicts: [],
    warns: ["hip"],
    exercises: ["Squat", "Leg press", "Leg curl", "Lunges"],
  },
  {
    id: "chest",
    label: "Chest",
    icon: "ti-gender-male",
    recovery: 48,
    conflicts: [],
    warns: ["arms"],
    exercises: ["Bench press", "Incline press", "Cable fly", "Dips"],
  },
  {
    id: "arms",
    label: "Arms",
    icon: "ti-barbell",
    recovery: 48,
    conflicts: [],
    warns: ["chest"],
    exercises: ["Bicep curl", "Tricep pushdown", "Hammer curl", "Overhead extension"],
  },
  {
    id: "core",
    label: "Core",
    icon: "ti-flame",
    recovery: 0,
    conflicts: [],
    warns: [],
    exercises: ["Plank", "Crunches", "Leg raise", "Russian twist"],
  },
];

const muscleIconMap: Record<string, LucideIcon> = {
  "ti-rotate": RotateCcw,
  "ti-arrows-vertical": ArrowUpDown,
  "ti-run": Footprints,
  "ti-gender-male": Circle,
  "ti-barbell": Dumbbell,
  "ti-flame": Flame,
};

function hasConflict(group: MuscleGroup, selectedMuscles: string[]) {
  return selectedMuscles.some((selectedId) => {
    const selected = muscleGroups.find((item) => item.id === selectedId);
    return group.conflicts.includes(selectedId) || Boolean(selected?.conflicts.includes(group.id));
  });
}

function hasWarning(group: MuscleGroup, selectedMuscles: string[]) {
  return selectedMuscles.some((selectedId) => {
    const selected = muscleGroups.find((item) => item.id === selectedId);
    return group.warns.includes(selectedId) || Boolean(selected?.warns.includes(group.id));
  });
}

function warningMessage(nextGroupId: string, selectedMuscles: string[]) {
  const selected = selectedMuscles
    .map((id) => muscleGroups.find((item) => item.id === id))
    .find((item): item is MuscleGroup => Boolean(item));
  const next = muscleGroups.find((item) => item.id === nextGroupId);
  if (!selected || !next) return `${next?.label ?? "These groups"} share fatigue. Continue?`;
  return `${next.label} and ${selected.label} share the posterior chain. Continue?`;
}

function emptyExerciseLog(group: MuscleGroup) {
  return group.exercises.reduce<Record<string, string[]>>((rows, exercise) => {
    rows[exercise] = ["", "", "", ""];
    return rows;
  }, {});
}

function totalCompletedSets(exerciseLog: ExerciseLog) {
  return Object.values(exerciseLog).reduce(
    (sum, exercises) => sum + Object.values(exercises).reduce((exerciseSum, sets) => exerciseSum + sets.filter(Boolean).length, 0),
    0,
  );
}

function totalPossibleSets(selectedMuscles: string[]) {
  return selectedMuscles.reduce((sum, muscleId) => {
    const group = muscleGroups.find((item) => item.id === muscleId);
    return sum + (group?.exercises.length ?? 0) * 4;
  }, 0);
}

function computeTotalVolume(exerciseLog: ExerciseLog) {
  return Object.values(exerciseLog).reduce(
    (sum, exercises) =>
      sum +
      Object.values(exercises).reduce((exerciseSum, sets) => {
        return exerciseSum + sets.reduce((setSum, value) => setSum + (Number.parseFloat(value) || 0), 0);
      }, 0),
    0,
  );
}

function playRestDoneCue() {
  navigator.vibrate?.(80);
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);
  } catch {
    // Audio feedback is optional; unsupported browsers can silently skip it.
  }
}

function MuscleTile({
  group,
  selected,
  muted,
  warned,
  punching,
  onClick,
}: {
  group: MuscleGroup;
  selected: boolean;
  muted: boolean;
  warned: boolean;
  punching: boolean;
  onClick: () => void;
}) {
  const Icon = muscleIconMap[group.icon] ?? Circle;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={muted}
      aria-label={group.label}
      aria-pressed={selected}
      className={cn("relative grid min-h-[84px] place-items-center rounded-[14px] border px-2 py-[14px] transition", punching && "tile-paw-click")}
      style={{
        background: selected ? gymGreen : warned ? "rgba(250, 199, 117, 0.15)" : "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderColor: selected ? "transparent" : warned ? "rgba(250, 199, 117, 0.8)" : "rgba(255,255,255,0.25)",
        borderStyle: muted ? "dashed" : "solid",
        borderWidth: "0.5px",
        color: selected ? "white" : warned ? "#FAC775" : "white",
        opacity: muted ? 0.28 : 1,
        pointerEvents: muted ? "none" : undefined,
      }}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2.35} />
      <span className="mt-1 text-[11px] font-semibold leading-none text-white">{group.label}</span>
      {muted ? <span className="mt-1 text-[9px] font-semibold text-white/50">✕ conflict</span> : null}
      {punching ? <PawPrint className="paw-punch pointer-events-none absolute inset-0 m-auto h-10 w-10 text-white" strokeWidth={2.8} /> : null}
    </button>
  );
}

function GymTimerCards({
  stopwatchSeconds,
  stopwatchRunning,
  restSeconds,
  restRunning,
  onToggleStopwatch,
  onResetStopwatch,
  onToggleRest,
}: {
  stopwatchSeconds: number;
  stopwatchRunning: boolean;
  restSeconds: number;
  restRunning: boolean;
  onToggleStopwatch: () => void;
  onResetStopwatch: () => void;
  onToggleRest: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-[16px] border border-white/20 bg-white/10 p-3 text-left backdrop-blur-[8px]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">Stopwatch</div>
        <div className="mt-1 text-[27px] font-semibold leading-none text-white">{formatClock(stopwatchSeconds)}</div>
        <div className="mt-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleStopwatch}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#1A1A1C]"
            aria-label={stopwatchRunning ? "Stop stopwatch" : "Start stopwatch"}
          >
            {stopwatchRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onResetStopwatch}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-white/10 text-white"
            aria-label="Reset stopwatch"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleRest}
        className="rounded-[16px] border border-white/20 bg-white/10 p-3 text-left backdrop-blur-[8px] transition active:scale-[0.98]"
        aria-label={restRunning ? "Pause rest timer" : "Start rest timer"}
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">Rest timer</div>
        <div className="mt-1 text-[27px] font-semibold leading-none text-white">{formatClock(restSeconds)}</div>
        <div className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-bold text-[#1A1A1C]">
          {restRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {restRunning ? "Pause" : "Tap rest"}
        </div>
      </button>
    </div>
  );
}

function GroceryPanel({ items, revealedId, onAdd, onToggle, onDelete, onReveal, onDone }: {
  items: ShoppingItem[];
  revealedId: string | null;
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReveal: (id: string | null) => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [dragStart, setDragStart] = useState<{ id: string; x: number } | null>(null);
  const sortedItems = [...items].sort((a, b) => Number(a.checked) - Number(b.checked));

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft("");
  };

  return (
    <section
      className="mt-8 rounded-[26px] border p-4 text-[#1A1A1C] shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
      style={{
        background: "rgba(255,255,255,0.52)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.35)",
        borderWidth: "0.5px",
      }}
    >
      <form
        className="flex items-center gap-2 rounded-full bg-white/35 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add item…"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#1A1A1C] outline-none placeholder:text-black/35"
        />
        <button type="submit" className="grid h-9 w-9 place-items-center rounded-full bg-[#111111] text-white" aria-label="Add item">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div
        className="mt-4 min-h-[264px] overflow-hidden rounded-[18px] px-1 py-1"
        style={{
          backgroundImage: "linear-gradient(to bottom, transparent 0, transparent 43px, rgba(0,0,0,0.06) 44px)",
          backgroundSize: "100% 44px",
        }}
      >
        {sortedItems.map((item) => {
          const revealed = revealedId === item.id;
          return (
            <div
              key={item.id}
              className="relative h-11 overflow-hidden"
              onPointerDown={(event) => setDragStart({ id: item.id, x: event.clientX })}
              onPointerUp={(event) => {
                if (dragStart?.id === item.id && event.clientX - dragStart.x < -42) onReveal(item.id);
                if (dragStart?.id === item.id && event.clientX - dragStart.x > 24) onReveal(null);
                setDragStart(null);
              }}
            >
              <button
                type="button"
                className="absolute right-0 top-1 grid h-9 w-9 place-items-center rounded-full bg-red-500 text-[20px] font-bold leading-none text-white"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.text}`}
              >
                ×
              </button>
              <div
                className="relative z-10 flex h-11 items-center gap-3 bg-transparent transition-transform duration-200"
                style={{ transform: revealed ? "translateX(-48px)" : "translateX(0)" }}
              >
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-black/20 bg-white/35 text-[13px] font-black text-[#4A8C5C]"
                  aria-label={`Check ${item.text}`}
                >
                  {item.checked ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1 truncate text-left text-[15px] font-semibold" style={{ textDecoration: item.checked ? "line-through" : "none", opacity: item.checked ? 0.48 : 1 }}>
                  {item.text}
                </div>
              </div>
            </div>
          );
        })}
        {!items.length ? (
          <div className="grid h-44 place-items-center text-center text-[14px] font-semibold text-black/35">
            Add what you need, one thing at a time.
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-[#111111] px-5 text-[15px] font-semibold text-white shadow-[0_18px_36px_-18px_rgba(0,0,0,0.55)]"
      >
        Done shopping →
      </button>
    </section>
  );
}

export function Committed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: commitment } = useCommitment(id);
  const { data: activities = [] } = useActivities();
  const [now, setNow] = useState(Date.now());
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [exerciseLog, setExerciseLog] = useState<ExerciseLog>({});
  const [activeMuscleId, setActiveMuscleId] = useState<string | null>(null);
  const [pawMuscleId, setPawMuscleId] = useState("");
  const [warningPrompt, setWarningPrompt] = useState<WarningPrompt>(null);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerMode, setTimerMode] = useState<"workout" | "rest">("workout");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    { id: "milk", text: "Milk", checked: false },
    { id: "bananas", text: "Bananas", checked: false },
    { id: "eggs", text: "Eggs", checked: false },
  ]);
  const [revealedShoppingId, setRevealedShoppingId] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timerMode !== "rest") return;
    const interval = window.setInterval(() => {
      setRestSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          setTimerMode("workout");
          playRestDoneCue();
          return restDuration;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [restDuration, timerMode]);

  useEffect(() => {
    if (!stopwatchRunning) return;
    const interval = window.setInterval(() => setStopwatchSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [stopwatchRunning]);

  const elapsed = useMemo(() => {
    const start = commitment?.started_at;
    return start ? Math.max(0, Math.floor((now - +new Date(start)) / 1000)) : 0;
  }, [commitment, now]);
  const minimumSeconds = (commitment?.minimum_minutes ?? 10) * 60;
  const remaining = Math.max(0, minimumSeconds - elapsed);
  const kept = remaining <= 0;
  const bonus = Math.max(0, elapsed - minimumSeconds);
  const timerRadius = 78;
  const timerCircumference = 2 * Math.PI * timerRadius;
  const timerProgress = timerMode === "rest" ? Math.max(0, Math.min(1, (restDuration - restSeconds) / restDuration)) : Math.min(elapsed / minimumSeconds, 1);
  const activity = activities.find((item) => item.id === commitment?.activity_id);
  const backgroundImage = activityBackgrounds[activity?.id ?? ""] ?? "/reference/quick.png";
  const accentColor = activityAccents[activity?.id ?? ""] ?? "#9D5BFF";
  const activityText = `${activity?.id ?? ""} ${activity?.key ?? ""} ${activity?.name ?? ""}`.toLowerCase();
  const isGroceryScreen = activityText.includes("grocery") || activityText.includes("errand") || activityText.includes("outside");
  const isWorkoutScreen = !isGroceryScreen && (activityText.includes("gym") || activityText.includes("quick"));
  const movingLabel = isGroceryScreen ? "Today's shopping list" : `${activity?.name ?? "Future you"} is moving`;
  const activeMuscle = muscleGroups.find((group) => group.id === activeMuscleId) ?? null;
  const timerValue = timerMode === "rest" ? formatClock(restSeconds) : kept ? formatClock(bonus) : formatClock(remaining);
  const timerLabel = timerMode === "rest" ? "rest" : kept ? "bonus" : "left";

  const selectMuscle = (groupId: string) => {
    const group = muscleGroups.find((item) => item.id === groupId);
    if (!group) return;
    setSelectedMuscles((current) => {
      if (current.includes(groupId)) {
        const next = current.filter((item) => item !== groupId);
        setActiveMuscleId((activeId) => (activeId === groupId ? next[next.length - 1] ?? null : activeId));
        return next;
      }
      setPawMuscleId(groupId);
      window.setTimeout(() => setPawMuscleId((currentId) => (currentId === groupId ? "" : currentId)), 560);
      setActiveMuscleId(groupId);
      setExerciseLog((currentLog) => ({
        ...currentLog,
        [groupId]: currentLog[groupId] ?? emptyExerciseLog(group),
      }));
      return [...current, groupId];
    });
  };

  const handleMuscleTap = (group: MuscleGroup) => {
    const selected = selectedMuscles.includes(group.id);
    if (!selected && hasConflict(group, selectedMuscles)) return;
    if (!selected && hasWarning(group, selectedMuscles)) {
      setWarningPrompt({ groupId: group.id, message: warningMessage(group.id, selectedMuscles) });
      return;
    }
    selectMuscle(group.id);
  };

  const confirmWarning = () => {
    if (!warningPrompt) return;
    selectMuscle(warningPrompt.groupId);
    setWarningPrompt(null);
  };

  const toggleRestTimer = () => {
    if (timerMode === "rest") {
      setTimerMode("workout");
      return;
    }
    setRestSeconds((seconds) => (seconds > 0 && seconds < restDuration ? seconds : restDuration));
    setTimerMode("rest");
  };

  const goToReflection = () => {
    navigate(`/reflect/${id}`, {
      state: isWorkoutScreen
        ? {
            workout: {
              muscleGroups: selectedMuscles,
              exerciseLog,
              totalVolume: computeTotalVolume(exerciseLog),
            },
          }
        : undefined,
    });
  };

  const goToGroceryReflection = () => {
    const boughtItems = shoppingItems.filter((item) => item.checked).map((item) => item.text);
    navigate(`/reflect/${id}`, {
      state: {
        grocery: {
          itemsBought: boughtItems,
          list: shoppingItems,
        },
      },
    });
  };

  const addShoppingItem = (text: string) => {
    setShoppingItems((current) => [{ id: crypto.randomUUID(), text, checked: false }, ...current]);
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingItems((current) => current.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item)));
    setRevealedShoppingId(null);
  };

  const deleteShoppingItem = (itemId: string) => {
    setShoppingItems((current) => current.filter((item) => item.id !== itemId));
    setRevealedShoppingId(null);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-7 text-white"
      style={{
        backgroundImage: `url('${backgroundImage}'), linear-gradient(160deg, #2A3140 0%, #3D4252 45%, #2D2A2F 100%)`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.52)_58%,rgba(0,0,0,0.74)_100%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col text-center">
        <nav className="flex items-center justify-between">
          <button onClick={() => navigate("/today")} className="text-[28px] italic leading-none text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}>
            AfterMe
          </button>
          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-[10px]">
            Out the door
          </span>
        </nav>

        <section className="mt-16 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: accentColor }}>
            <Sparkles className="h-3.5 w-3.5" />
            {movingLabel}
          </div>
        </section>

        {isGroceryScreen ? (
          <GroceryPanel
            items={shoppingItems}
            revealedId={revealedShoppingId}
            onAdd={addShoppingItem}
            onToggle={toggleShoppingItem}
            onDelete={deleteShoppingItem}
            onReveal={setRevealedShoppingId}
            onDone={goToGroceryReflection}
          />
        ) : null}

        {isWorkoutScreen ? (
          <section className="mt-3">
            <GymTimerCards
              stopwatchSeconds={stopwatchSeconds}
              stopwatchRunning={stopwatchRunning}
              restSeconds={restSeconds}
              restRunning={timerMode === "rest"}
              onToggleStopwatch={() => setStopwatchRunning((running) => !running)}
              onResetStopwatch={() => {
                setStopwatchRunning(false);
                setStopwatchSeconds(0);
              }}
              onToggleRest={toggleRestTimer}
            />
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="mt-3 grid min-w-full grid-cols-3 gap-2">
                {muscleGroups.map((group) => {
                  const selected = selectedMuscles.includes(group.id);
                  const muted = !selected && hasConflict(group, selectedMuscles);
                  const warned = !selected && hasWarning(group, selectedMuscles);
                  return (
                    <MuscleTile
                      key={group.id}
                      group={group}
                      selected={selected}
                      muted={muted}
                      warned={warned}
                      punching={pawMuscleId === group.id}
                      onClick={() => handleMuscleTap(group)}
                    />
                  );
                })}
              </div>
            </div>
            <div className="mt-2 text-center text-[11px] text-white/65">
              {selectedMuscles.length} of {muscleGroups.length} muscle groups
            </div>
            {activeMuscle ? (
              <div className="mt-2 text-center text-[11px] font-semibold text-white/55">
                Sets move to journal for {activeMuscle.label}.
              </div>
            ) : null}
          </section>
        ) : null}

        {!isGroceryScreen ? <section className="my-auto grid place-items-center">
          <div className="relative grid h-48 w-48 place-items-center rounded-full bg-white/15 shadow-[0_18px_42px_rgba(0,0,0,0.25)] backdrop-blur-[18px]">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 180 180" aria-hidden="true">
              <circle cx="90" cy="90" r={timerRadius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="10" />
              <circle
                cx="90"
                cy="90"
                r={timerRadius}
                fill="none"
                stroke={accentColor}
                strokeLinecap="round"
                strokeWidth="10"
                strokeDasharray={timerCircumference}
                strokeDashoffset={timerCircumference * (1 - timerProgress)}
                style={{ transition: "stroke-dashoffset 0.4s ease, stroke 0.3s ease" }}
              />
            </svg>
            <div className="relative text-center text-white">
              <div className="text-[42px] font-semibold leading-none tracking-[-0.02em]">{timerValue}</div>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/68">{timerLabel}</div>
            </div>
          </div>
        </section> : <div className="flex-1" />}

        {!isGroceryScreen ? <button
          onClick={goToReflection}
          className="mb-3 flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 font-semibold text-white shadow-[0_18px_36px_-12px_rgba(0,0,0,0.32)]"
          style={{ background: accentColor }}
          aria-label="Continue to reflection"
        >
          Time to reflect
          <ArrowRight className="h-4 w-4" />
        </button> : null}

        {warningPrompt ? (
          <div className="fixed inset-x-4 bottom-36 z-50 rounded-[22px] border border-white/30 bg-white/15 p-4 text-left text-white shadow-[0_18px_46px_rgba(0,0,0,0.26)] backdrop-blur-[18px]">
            <div className="text-[14px] font-semibold leading-5">{warningPrompt.message}</div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWarningPrompt(null)}
                className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-[12px] font-bold text-white backdrop-blur-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWarning}
                className="rounded-full border border-white/30 bg-white/25 px-4 py-2 text-[12px] font-bold text-white backdrop-blur-[8px]"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
