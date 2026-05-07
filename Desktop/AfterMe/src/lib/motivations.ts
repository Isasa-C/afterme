export type MotivationIconKey = "star" | "leaf" | "zap" | "smile" | "heart" | "plus";

export type Motivation = {
  id: string;
  label: string;
  iconKey: MotivationIconKey;
};

export const defaultMotivations: Motivation[] = [
  { id: "proud", iconKey: "star", label: "Proud that you showed up" },
  { id: "clearer", iconKey: "leaf", label: "Less stress, clearer mind" },
  { id: "energy", iconKey: "zap", label: "More energy" },
  { id: "confident", iconKey: "smile", label: "More confident" },
  { id: "mood", iconKey: "heart", label: "Better mood" },
];

const motivationStorageKey = "afterme.motivations";
const legacyReasonStorageKey = "afterme.today.reasons";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `motivation-${Date.now()}`;
}

function normalizeMotivations(value: unknown): Motivation[] | null {
  if (!Array.isArray(value)) return null;
  const motivations = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybeMotivation = item as Partial<Motivation>;
      if (!maybeMotivation.id || !maybeMotivation.label) return null;
      return {
        id: maybeMotivation.id,
        label: maybeMotivation.label,
        iconKey: maybeMotivation.iconKey ?? "plus",
      };
    })
    .filter((item): item is Motivation => Boolean(item));
  return motivations;
}

export function getMotivations() {
  try {
    const saved = window.localStorage.getItem(motivationStorageKey);
    const motivations = saved ? normalizeMotivations(JSON.parse(saved)) : null;
    if (motivations) return motivations;

    const legacySaved = window.localStorage.getItem(legacyReasonStorageKey);
    const legacyReasons = legacySaved ? (JSON.parse(legacySaved) as string[]) : [];
    const migratedMotivations = [
      ...defaultMotivations,
      ...legacyReasons.map((label) => ({ id: createId(), iconKey: "plus" as const, label })),
    ];
    window.localStorage.setItem(motivationStorageKey, JSON.stringify(migratedMotivations));
    return migratedMotivations;
  } catch {
    return defaultMotivations;
  }
}

export function saveMotivations(motivations: Motivation[]) {
  window.localStorage.setItem(motivationStorageKey, JSON.stringify(motivations));
}

export function createMotivation(label: string): Motivation {
  return { id: createId(), iconKey: "plus", label };
}
