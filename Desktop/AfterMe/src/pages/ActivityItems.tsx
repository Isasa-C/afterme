import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ItemIcon } from "../components/ItemIcon";
import {
  useActivities,
  useActivityItems,
  useCreateActivityItem,
  useDeleteActivityItem,
  useReorderActivityItems,
  useResetActivityItems,
  useUpdateActivity,
  useUpdateActivityItem,
} from "../hooks/useAfterMeData";
import type { ActivityItem, ItemIconKey } from "../lib/types";

const iconOptions: ItemIconKey[] = ["droplet", "headphones", "shirt", "footprints", "key", "door", "cloud-sun", "user", "message-circle", "pencil", "send", "x-square", "smartphone", "file-text", "play"];

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ActivityItem;
  onEdit: (item: ActivityItem) => void;
  onDelete: (item: ActivityItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 border-b border-slate-100 bg-white/80 py-2.5"
    >
      <button className="text-slate-400" {...attributes} {...listeners} aria-label="Drag item">
        <GripVertical className="h-5 w-5" />
      </button>
      <ItemIcon iconKey={item.icon_key} />
      <button onClick={() => onEdit(item)} className="flex-1 text-left">
        <div className="font-bold text-ink">{item.label}</div>
        <div className="text-sm text-slate-500">{item.is_door_step ? "Final step" : item.icon_key}</div>
      </button>
      <button onClick={() => onDelete(item)} className="text-red-500" aria-label="Delete item">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

export function ActivityItems() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: activities = [] } = useActivities();
  const activity = activities.find((item) => item.id === id);
  const { data: items = [] } = useActivityItems(id);
  const createItem = useCreateActivityItem();
  const updateActivity = useUpdateActivity();
  const updateItem = useUpdateActivityItem();
  const deleteItem = useDeleteActivityItem();
  const reorderItems = useReorderActivityItems();
  const resetItems = useResetActivityItems();
  const sensors = useSensors(useSensor(PointerSensor));
  const [editing, setEditing] = useState<ActivityItem | null>(null);
  const [activityTitle, setActivityTitle] = useState("");
  const [label, setLabel] = useState("");
  const [iconKey, setIconKey] = useState<ItemIconKey>("key");
  const [isDoorStep, setIsDoorStep] = useState(false);
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const titleChanged = Boolean(activity && activityTitle.trim() && activityTitle.trim() !== activity.name);

  useEffect(() => {
    setActivityTitle(activity?.name ?? "");
  }, [activity?.name]);

  const openNew = () => {
    setEditing(null);
    setLabel("");
    setIconKey("key");
    setIsDoorStep(false);
  };

  const openEdit = (item: ActivityItem) => {
    setEditing(item);
    setLabel(item.label);
    setIconKey(item.icon_key);
    setIsDoorStep(item.is_door_step);
  };

  const save = async () => {
    if (!id || !label.trim()) return;
    if (editing) {
      await updateItem.mutateAsync({ itemId: editing.id, patch: { label: label.trim(), icon_key: iconKey, is_door_step: isDoorStep } });
    } else {
      await createItem.mutateAsync({ activityId: id, label: label.trim(), iconKey });
    }
    openNew();
  };

  const saveActivityTitle = async () => {
    if (!id || !titleChanged) return;
    await updateActivity.mutateAsync({ activityId: id, patch: { name: activityTitle.trim() } });
  };

  const onDragEnd = async (event: DragEndEvent) => {
    if (!id || !event.over || event.active.id === event.over.id) return;
    const oldIndex = itemIds.indexOf(String(event.active.id));
    const newIndex = itemIds.indexOf(String(event.over.id));
    await reorderItems.mutateAsync({ activityId: id, orderedIds: arrayMove(itemIds, oldIndex, newIndex) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EFF7FF] via-[#F6FBFF] to-[#D4F0E3] px-4 py-5 text-ink">
      <main className="mx-auto max-w-md">
        <button onClick={() => navigate(-1)} className="mb-5 text-[14px] font-semibold text-slate-600">← Back</button>
        <h1 className="text-[26px] font-semibold leading-tight text-ink">{activity?.name ?? "Routine"} routine</h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">Shape the little steps that help you start.</p>

        <section className="mt-5 rounded-card bg-white/65 p-3">
          <label className="block text-sm font-bold text-ink">
            Routine name
            <input
              value={activityTitle}
              maxLength={30}
              onChange={(event) => setActivityTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-base font-semibold outline-none focus:border-brand-400"
              placeholder="Routine name"
            />
          </label>
          <button
            onClick={saveActivityTitle}
            disabled={!titleChanged || updateActivity.isPending}
            className="mt-3 w-full rounded-2xl bg-brand-600 px-4 py-2.5 font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
          >
            Save name
          </button>
        </section>

        <section className="mt-5 rounded-card bg-white/65 px-3">
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                  onDelete={(row) => id && deleteItem.mutate({ itemId: row.id, activityId: id })}
                />
              ))}
            </SortableContext>
          </DndContext>
        </section>

        <section className="mt-5 rounded-card bg-white/65 p-3">
          <h2 className="font-semibold text-ink">{editing ? "Edit step" : "Add a step"}</h2>
          <input className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-2.5" placeholder="Step label" value={label} onChange={(event) => setLabel(event.target.value)} />
          <select className="mt-2.5 w-full rounded-2xl border border-slate-200 px-4 py-2.5" value={iconKey} onChange={(event) => setIconKey(event.target.value as ItemIconKey)}>
            {iconOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={isDoorStep} onChange={(event) => setIsDoorStep(event.target.checked)} />
            Final step
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={openNew} className="rounded-2xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600">Clear</button>
            <button onClick={save} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 font-bold text-white"><Plus className="h-5 w-5" /> Save</button>
          </div>
        </section>

        <button onClick={() => id && resetItems.mutate(id)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/50 px-4 py-2.5 font-bold text-brand-700">
          <RotateCcw className="h-5 w-5" /> Restore starter steps
        </button>
      </main>
    </div>
  );
}
