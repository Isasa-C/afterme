import { Dumbbell, Flame, Target } from "lucide-react";
import { ActivityIcon } from "../components/ActivityIcon";
import { AppShell } from "../components/AppShell";
import { Mascot } from "../components/Mascot";
import { OutcomePill } from "../components/OutcomePill";
import { ProgressBar } from "../components/ProgressBar";
import { StatTile } from "../components/StatTile";
import { Card, SectionHeader } from "../components/ui";

export function Design() {
  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-semibold text-ink">Design QA</h1>
      <SectionHeader title="Cards" actionLabel="Action" />
      <Card className="mb-6">Soft white card with rounded corners.</Card>
      <SectionHeader title="Activity icons" />
      <Card className="mb-6">
        <div className="flex gap-3">
          {(["gym", "focus", "outside", "social", "custom"] as const).map((key) => <ActivityIcon key={key} activityKey={key} />)}
        </div>
      </Card>
      <SectionHeader title="Stats" />
      <Card className="mb-6">
        <div className="grid grid-cols-3">
          <StatTile icon={<Flame className="h-6 w-6" />} number="4" label="Streak" color="text-orange-500" />
          <StatTile icon={<Target className="h-6 w-6" />} number="70%" label="Better" color="text-green-600" />
          <StatTile icon={<Dumbbell className="h-6 w-6" />} number="21" label="Done" color="text-brand-600" />
        </div>
      </Card>
      <SectionHeader title="Progress and outcomes" />
      <Card className="mb-6 space-y-4">
        <ProgressBar value={75} colorKey="gym" />
        <div className="flex gap-2"><OutcomePill outcome="better" /><OutcomePill outcome="same" /><OutcomePill outcome="worse" /></div>
      </Card>
      <SectionHeader title="Mascot" />
      <Card>
        <div className="grid grid-cols-2">
          <Mascot variant="hugging-heart" />
          <Mascot variant="waving" />
          <Mascot variant="celebrating" />
          <Mascot variant="thinking" />
        </div>
      </Card>
    </AppShell>
  );
}
