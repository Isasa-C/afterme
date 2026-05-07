import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Apple,
  ArrowLeft,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Coffee,
  Dumbbell,
  Footprints,
  GripVertical,
  Headphones,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music,
  Plus,
  Sparkles,
  Sun,
  TreePine,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { Card, IconButton } from "../components/ui";
import {
  useActivities,
  useArchiveActivity,
  useArchivedActivities,
  useCreateActivity,
  useReorderActivities,
  useRestoreActivity,
  useStatsByActivity,
} from "../hooks/useAfterMeData";
import type { Activity, ActivityColorKey } from "../lib/types";
import { cn } from "../lib/utils";

const iconChoices: Array<{ key: string; label: string; Icon: LucideIcon }> = [
  { key: "dumbbell", label: "Gym", Icon: Dumbbell },
  { key: "footprints", label: "Walk", Icon: Footprints },
  { key: "bike", label: "Bike", Icon: Bike },
  { key: "book", label: "Read", Icon: BookOpen },
  { key: "headphones", label: "Listen", Icon: Headphones },
  { key: "coffee", label: "Coffee", Icon: Coffee },
  { key: "music", label: "Music", Icon: Music },
  { key: "sparkles", label: "Spark", Icon: Sparkles },
  { key: "heart", label: "Heart", Icon: Heart },
  { key: "message-circle", label: "Chat", Icon: MessageCircle },
  { key: "briefcase", label: "Work", Icon: BriefcaseBusiness },
  { key: "sun", label: "Sun", Icon: Sun },
  { key: "tree", label: "Tree", Icon: TreePine },
  { key: "apple", label: "Food", Icon: Apple },
];

const colorChoices: Array<{ key: ActivityColorKey; label: string; className: string }> = [
  { key: "blue", label: "Blue", className: "bg-brand-500" },
  { key: "green", label: "Green", className: "bg-green-500" },
  { key: "orange", label: "Orange", className: "bg-orange-400" },
  { key: "pink", label: "Pink", className: "bg-pink-500" },
  { key: "yellow", label: "Yellow", className: "bg-yellow-400" },
];

function SortableActivityRow({
  activity,
  count,
  highlighted,
  onEdit,
  onRemove,
}: {
  activity: Activity;
  count: number;
  highlighted: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-3 transition hover:bg-white/85",
        highlighted && "bg-brand-50 ring-2 ring-brand-100",
        isDragging && "z-10 shadow-soft",
      )}
    >
      <button className="grid h-10 w-8 place-items-center text-slate-400" aria-label={`Drag ${activity.name}`} {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} className="h-11 w-11" />
      <button className="min-w-0 flex-1 text-left" onClick={onEdit}>
        <div className="truncate text-base font-semibold text-ink">{activity.name}</div>
        <div className="text-sm font-semibold text-slate-500">{count} starts</div>
      </button>
      <button className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-[#F7F3FF] hover:text-brand-600" aria-label={`More options for ${activity.name}`} onClick={() => setMenuOpen((value) => !value)}>
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {menuOpen ? (
        <div className="absolute right-8 top-14 z-20 w-44 overflow-hidden rounded-2xl bg-white shadow-soft">
          <button className="block w-full px-4 py-3 text-left text-sm font-bold text-ink" onClick={onEdit}>
            Rename and tune
          </button>
          <button className="block w-full px-4 py-3 text-left text-sm font-bold text-red-500" onClick={onRemove}>
            Pause routine
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function AddActivitySheet({
  onClose,
  onCreated,
  title = "Add routine",
  nameLabel = "Name your routine",
  namePlaceholder = "e.g. Yoga class",
  submitLabel = "Create routine",
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
}) {
  const createActivity = useCreateActivity();
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState("sparkles");
  const [colorKey, setColorKey] = useState<ActivityColorKey>("blue");
  const [customize, setCustomize] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(10);
  const [minimumMinutes, setMinimumMinutes] = useState(10);
  const [showMoreIcons, setShowMoreIcons] = useState(false);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const activity = await createActivity.mutateAsync({
      name: trimmed,
      iconKey,
      colorKey,
      defaultDurationMin: defaultDuration,
      minimumMinutes,
    });
    onCreated(activity.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/20 px-3" onClick={onClose}>
      <div className="max-h-[76vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-soft" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-500" aria-label="Close add activity" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block text-sm font-semibold text-ink">
          {nameLabel}
          <input
            value={name}
            maxLength={30}
            onChange={(event) => setName(event.target.value)}
            placeholder={namePlaceholder}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold outline-none focus:border-brand-400"
          />
        </label>

        <div className="mt-6">
          <div className="text-sm font-semibold text-ink">Pick an icon</div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {iconChoices.slice(0, showMoreIcons ? iconChoices.length : 8).map(({ key, label, Icon }) => (
              <button
                key={key}
                className={cn("grid h-16 w-16 shrink-0 place-items-center rounded-2xl border bg-brand-50 text-brand-600", iconKey === key ? "border-brand-500 ring-2 ring-brand-200" : "border-transparent")}
                title={label}
                onClick={() => setIconKey(key)}
              >
                <Icon className="h-7 w-7" />
              </button>
            ))}
          </div>
          <button className="mt-1 text-sm font-bold text-brand-600" onClick={() => setShowMoreIcons((value) => !value)}>
            {showMoreIcons ? "Fewer icons" : "More icons"}
          </button>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-ink">Pick a color</div>
          <div className="mt-3 flex gap-3">
            {colorChoices.map((color) => (
              <button
                key={color.key}
                aria-label={color.label}
                className={cn("h-8 w-8 rounded-full", color.className, colorKey === color.key && "ring-2 ring-brand-500 ring-offset-2")}
                onClick={() => setColorKey(color.key)}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 p-4">
          <button className="flex w-full items-center justify-between text-left font-semibold text-ink" onClick={() => setCustomize((value) => !value)}>
            Tune the timing
            <span className="text-brand-600">{customize ? "−" : "+"}</span>
          </button>
          {customize ? (
            <div className="mt-4 space-y-4">
              <p className="text-sm font-semibold text-slate-500">You can change these later.</p>
              <label className="block text-sm font-bold text-ink">
                Default duration
                <input type="number" min={5} max={60} value={defaultDuration} onChange={(event) => setDefaultDuration(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="block text-sm font-bold text-ink">
                Minimum minutes
                <input type="number" min={5} max={60} value={minimumMinutes} onChange={(event) => setMinimumMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
          ) : null}
        </div>

        <p className="mt-5 text-sm font-semibold leading-6 text-slate-500">We'll start with a few gentle steps. You can change them after saving.</p>
        <button
          className="mt-5 h-12 w-full rounded-2xl bg-brand-600 font-semibold text-white disabled:bg-slate-200 disabled:text-slate-400"
          disabled={!name.trim() || createActivity.isPending}
          onClick={create}
        >
          {submitLabel}
        </button>
        <button className="mt-4 w-full text-center text-sm font-bold text-slate-500" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ProfileActivities() {
  const navigate = useNavigate();
  const { data: activities = [] } = useActivities();
  const { data: archivedActivities = [] } = useArchivedActivities();
  const { data: stats = [] } = useStatsByActivity();
  const reorderActivities = useReorderActivities();
  const archiveActivity = useArchiveActivity();
  const restoreActivity = useRestoreActivity();
  const [orderedActivities, setOrderedActivities] = useState<Activity[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Activity | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const countByActivity = useMemo(() => new Map(stats.map((item) => [item.activityId, item.count])), [stats]);

  useEffect(() => {
    setOrderedActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (!highlightedId) return;
    const timeout = window.setTimeout(() => setHighlightedId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [highlightedId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedActivities.findIndex((activity) => activity.id === active.id);
    const newIndex = orderedActivities.findIndex((activity) => activity.id === over.id);
    const next = arrayMove(orderedActivities, oldIndex, newIndex);
    setOrderedActivities(next);
    reorderActivities.mutate(next.map((activity, index) => ({ id: activity.id, sort_order: index + 1 })));
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <IconButton aria-label="Back to profile" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-6 w-6" />
          </IconButton>
          <h1 className="text-center text-3xl font-semibold text-ink">Edit routines</h1>
          <IconButton aria-label="Add routine" onClick={() => setAddOpen(true)}>
            <Plus className="h-6 w-6 text-brand-600" />
          </IconButton>
        </header>

        {orderedActivities.length ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedActivities.map((activity) => activity.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2.5">
                {orderedActivities.map((activity) => (
                  <SortableActivityRow
                    key={activity.id}
                    activity={activity}
                    count={countByActivity.get(activity.id) ?? 0}
                    highlighted={highlightedId === activity.id}
                    onEdit={() => navigate(`/profile/activities/${activity.id}`)}
                    onRemove={() => setRemoveTarget(activity)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Card className="grid place-items-center py-12 text-center">
            <button className="grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white" onClick={() => setAddOpen(true)} aria-label="Add your first activity">
              <Plus className="h-8 w-8" />
            </button>
            <p className="mt-4 text-xl font-semibold text-ink">Add your first activity</p>
          </Card>
        )}

        {archivedActivities.length ? (
          <section className="mt-5">
            <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Paused routines</h2>
            <div className="space-y-2.5">
              {archivedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 rounded-2xl bg-white/50 px-3 py-3 opacity-70">
                  <ActivityIcon activityKey={activity.key} iconKey={activity.icon_key} colorKey={activity.color_key} className="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-ink">{activity.name}</div>
                    <div className="text-sm font-semibold text-slate-500">{countByActivity.get(activity.id) ?? 0} starts</div>
                  </div>
                  <button className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600" onClick={() => restoreActivity.mutate(activity.id)}>
                    Bring back
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {addOpen ? <AddActivitySheet onClose={() => setAddOpen(false)} onCreated={setHighlightedId} /> : null}

      {removeTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-semibold text-ink">Pause {removeTarget.name}?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              It will leave your Today choices, but your past starts and reflections stay in History.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-slate-200 py-3 font-bold text-ink" onClick={() => setRemoveTarget(null)}>
                Cancel
              </button>
              <button
                className="rounded-2xl bg-brand-600 py-3 font-bold text-white"
                onClick={() => {
                  archiveActivity.mutate(removeTarget.id);
                  setRemoveTarget(null);
                }}
              >
                Pause
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
