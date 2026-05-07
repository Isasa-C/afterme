import { ArrowLeft, Heart, Leaf, Pencil, Plus, Save, SmilePlus, Star, Trash2, X, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { IconButton } from "../components/ui";
import { createMotivation, getMotivations, saveMotivations, type Motivation, type MotivationIconKey } from "../lib/motivations";

const motivationIcons: Record<MotivationIconKey, LucideIcon> = {
  star: Star,
  leaf: Leaf,
  zap: Zap,
  smile: SmilePlus,
  heart: Heart,
  plus: Plus,
};

export function ProfileMotivations() {
  const navigate = useNavigate();
  const [motivations, setMotivations] = useState<Motivation[]>(getMotivations);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  const persist = (nextMotivations: Motivation[]) => {
    setMotivations(nextMotivations);
    saveMotivations(nextMotivations);
  };

  const addMotivation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    persist([...motivations, createMotivation(label)]);
    setNewLabel("");
  };

  const startEditing = (motivation: Motivation) => {
    setEditingId(motivation.id);
    setEditingLabel(motivation.label);
  };

  const saveEditing = () => {
    const label = editingLabel.trim();
    if (!editingId || !label) return;
    persist(motivations.map((motivation) => (motivation.id === editingId ? { ...motivation, label } : motivation)));
    setEditingId(null);
    setEditingLabel("");
  };

  const deleteMotivation = (id: string) => {
    persist(motivations.filter((motivation) => motivation.id !== id));
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <IconButton aria-label="Back to profile" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-6 w-6" />
          </IconButton>
          <h1 className="text-center text-3xl font-semibold text-ink">Your motivations</h1>
          <span className="h-12 w-12" />
        </header>

        <form onSubmit={addMotivation} className="mb-4 rounded-[24px] bg-[#F5F0FF]/70 p-3">
          <label className="block text-sm font-bold text-ink">
            Add something future you can remember
            <input
              value={newLabel}
              maxLength={48}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="e.g. I sleep better after"
              className="mt-2 h-11 w-full rounded-[16px] bg-[#F7F3FF] px-4 text-[15px] font-bold text-ink outline-none ring-1 ring-transparent focus:ring-[#9C7DFF]"
            />
          </label>
          <button type="submit" disabled={!newLabel.trim()} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[16px] bg-brand-600 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>

        <div className="space-y-2.5">
          {motivations.map((motivation) => {
            const Icon = motivationIcons[motivation.iconKey] ?? Plus;
            const editing = editingId === motivation.id;
            return (
              <div key={motivation.id} className="rounded-[22px] bg-white/55 px-3 py-2.5">
                {editing ? (
                  <div>
                    <input
                      value={editingLabel}
                      maxLength={48}
                      onChange={(event) => setEditingLabel(event.target.value)}
                      className="h-11 w-full rounded-[16px] bg-[#F7F3FF] px-4 text-[15px] font-bold text-ink outline-none ring-1 ring-transparent focus:ring-[#9C7DFF]"
                      autoFocus
                    />
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                      <button type="button" onClick={() => setEditingId(null)} className="flex h-10 items-center justify-center gap-2 rounded-[16px] bg-[#F7F3FF] text-sm font-bold text-brand-600">
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button type="button" onClick={saveEditing} disabled={!editingLabel.trim()} className="flex h-10 items-center justify-center gap-2 rounded-[16px] bg-brand-600 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-400">
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] bg-[#F1ECFF] text-brand-600">
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 flex-1 text-[15px] font-bold leading-snug text-ink">{motivation.label}</div>
                    <button type="button" aria-label={`Edit ${motivation.label}`} onClick={() => startEditing(motivation)} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-[#F7F3FF] hover:text-brand-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label={`Delete ${motivation.label}`} onClick={() => deleteMotivation(motivation.id)} className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
