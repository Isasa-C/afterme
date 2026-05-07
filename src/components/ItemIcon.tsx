import {
  CloudSun,
  DoorOpen,
  Droplet,
  FileText,
  Footprints,
  Headphones,
  KeyRound,
  MessageCircle,
  Pencil,
  Play,
  Send,
  Shirt,
  Smartphone,
  User,
  XSquare,
} from "lucide-react";
import type { ItemIconKey } from "../lib/types";
import { cn } from "../lib/utils";

const iconMap = {
  droplet: Droplet,
  headphones: Headphones,
  shirt: Shirt,
  footprints: Footprints,
  key: KeyRound,
  door: DoorOpen,
  "cloud-sun": CloudSun,
  user: User,
  "message-circle": MessageCircle,
  pencil: Pencil,
  send: Send,
  "x-square": XSquare,
  smartphone: Smartphone,
  "file-text": FileText,
  play: Play,
};

export function ItemIcon({ iconKey, className }: { iconKey: ItemIconKey; className?: string }) {
  const Icon = iconMap[iconKey];
  return (
    <span className={cn("glass-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#D86D3A]", className)}>
      <Icon className="h-5 w-5" strokeWidth={2.4} />
    </span>
  );
}
