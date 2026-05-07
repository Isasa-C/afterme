import {
  Apple,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Coffee,
  Dumbbell,
  Footprints,
  Headphones,
  Heart,
  Laptop,
  MessageCircle,
  Music,
  Sparkle,
  Sun,
  TreePine,
  Waves,
} from "lucide-react";
import type { ActivityColorKey, ActivityKey } from "../lib/types";
import { cn } from "../lib/utils";

const iconMap = {
  gym: Dumbbell,
  focus: Laptop,
  outside: Footprints,
  social: MessageCircle,
  custom: BriefcaseBusiness,
};

const customIconMap = {
  apple: Apple,
  bike: Bike,
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  coffee: Coffee,
  dumbbell: Dumbbell,
  footprints: Footprints,
  headphones: Headphones,
  heart: Heart,
  laptop: Laptop,
  "message-circle": MessageCircle,
  music: Music,
  sparkles: Sparkle,
  sun: Sun,
  tree: TreePine,
  waves: Waves,
};

const colorMap = {
  gym: "glass-icon text-[#F06445]",
  focus: "glass-icon text-[#2FA66F]",
  outside: "glass-icon text-[#D98416]",
  social: "glass-icon text-[#D65C8A]",
  custom: "glass-icon text-[#4E91A8]",
};

const customColorMap: Record<ActivityColorKey, string> = {
  green: "glass-icon text-[#2FA66F]",
  orange: "glass-icon text-[#F06445]",
  blue: "glass-icon text-[#32A6C8]",
  pink: "glass-icon text-[#D65C8A]",
  yellow: "glass-icon text-[#D98416]",
};

const transparentColorMap = {
  gym: "bg-white/20 text-[#9D5BFF]",
  focus: "bg-white/20 text-[#E8A838]",
  outside: "bg-white/20 text-[#4A9E6B]",
  social: "bg-white/20 text-[#D4546A]",
  custom: "bg-white/20 text-[#2A82C4]",
};

export function ActivityIcon({
  activityKey,
  iconKey,
  colorKey,
  className,
  tone = "default",
}: {
  activityKey: ActivityKey;
  iconKey?: string;
  colorKey?: ActivityColorKey;
  className?: string;
  tone?: "default" | "lavender" | "transparent";
}) {
  const Icon = iconKey ? customIconMap[iconKey as keyof typeof customIconMap] ?? iconMap[activityKey] ?? Sparkle : iconMap[activityKey] ?? Sparkle;
  const toneClassName = tone === "transparent" ? transparentColorMap[activityKey] : tone === "lavender" ? "bg-[#FFF0E7] text-[#F06445]" : colorKey ? customColorMap[colorKey] : colorMap[activityKey];
  return (
    <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl", toneClassName, className)}>
      <Icon className="h-7 w-7" strokeWidth={2.6} />
    </span>
  );
}
