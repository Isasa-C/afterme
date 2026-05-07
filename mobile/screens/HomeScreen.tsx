import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import ActivityItem from "../components/ActivityItem";
import ChecklistItem from "../components/ChecklistItem";
import DurationSelector from "../components/DurationSelector";
import GlassPanel from "../components/GlassPanel";
import PrimaryButton from "../components/PrimaryButton";
import { activities } from "../data/activities";

type Phase = "idle" | "running" | "finished";

const SCREEN_TITLE = {
  fontSize: 16,
  letterSpacing: 3,
  fontWeight: "600" as const,
};

const CARD_TITLE = {
  fontSize: 16,
  fontWeight: "600" as const,
};

const BODY = {
  fontSize: 13,
  fontWeight: "500" as const,
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;
  const baseActivity = activities[0];
  if (!baseActivity) return null;

  const [selectedId, setSelectedId] = useState(baseActivity.id);
  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedId) ?? baseActivity,
    [baseActivity, selectedId],
  );

  const [durationMinutes, setDurationMinutes] = useState(selectedActivity.durationMinutes);
  const [phase, setPhase] = useState<Phase>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(selectedActivity.checklist.map(() => false));

  useEffect(() => {
    setDurationMinutes(selectedActivity.durationMinutes);
    setRemainingSeconds(selectedActivity.durationMinutes * 60);
    setChecks(selectedActivity.checklist.map(() => false));
    setPhase("idle");
    setIsPaused(false);
  }, [selectedActivity]);

  useEffect(() => {
    if (phase !== "running" || isPaused) return;

    const interval = setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          setPhase("finished");
          setIsPaused(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused]);

  const start = () => {
    setRemainingSeconds(durationMinutes * 60);
    setIsPaused(false);
    setPhase("running");
  };

  const finish = () => {
    setRemainingSeconds(0);
    setIsPaused(false);
    setPhase("finished");
  };

  const restart = () => {
    setChecks(selectedActivity.checklist.map(() => false));
    setRemainingSeconds(durationMinutes * 60);
    setIsPaused(false);
    setPhase("idle");
  };

  const content = (
    <>
      <GlassPanel style={styles.column}>
        <View style={styles.panelHeaderRow}>
          <Text style={[styles.screenTitle, SCREEN_TITLE]}>ACTIVITIES</Text>
          <Pressable onPress={() => Alert.alert("Add activity", "Add activity coming soon.")}>
            <Text style={styles.addButton}>+ Add</Text>
          </Pressable>
        </View>
        <View style={styles.listWrap}>
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              active={activity.id === selectedActivity.id}
              onPress={() => setSelectedId(activity.id)}
            />
          ))}
        </View>
      </GlassPanel>

      <GlassPanel style={styles.centerColumn}>
        {phase === "idle" ? (
          <>
            <View style={styles.mainIconWrap}>
              <MaterialCommunityIcons name={selectedActivity.icon as never} size={46} color="#4D40BD" />
            </View>
            <Text style={[styles.mainTitle, { fontSize: 34, fontWeight: "700" }]}>{selectedActivity.title}</Text>
            <Text style={[styles.body, BODY]}>{selectedActivity.subtitle}</Text>

            <View style={styles.durationBlock}>
              <Text style={[styles.cardTitle, CARD_TITLE]}>Duration</Text>
              <DurationSelector value={durationMinutes} onChange={setDurationMinutes} min={1} max={180} />
            </View>

            <PrimaryButton label="START" onPress={start} style={styles.buttonSpacing} />
          </>
        ) : null}

        {phase === "running" ? (
          <>
            <Text style={[styles.mainTitle, { fontSize: 34, fontWeight: "700" }]}>{selectedActivity.title}</Text>
            <Text style={[styles.timerText, { fontSize: 56, fontWeight: "700" }]}>{formatTime(remainingSeconds)}</Text>
            <Text style={[styles.body, BODY]}>{isPaused ? "Paused" : "In progress"}</Text>
            <View style={styles.runningButtons}>
              <PrimaryButton label={isPaused ? "Resume" : "Pause"} onPress={() => setIsPaused((value) => !value)} variant="secondary" style={styles.runningButton} />
              <PrimaryButton label="Finish" onPress={finish} style={styles.runningButton} />
            </View>
          </>
        ) : null}

        {phase === "finished" ? (
          <>
            <Text style={[styles.mainTitle, { fontSize: 34, fontWeight: "700" }]}>Finished!</Text>
            <View style={styles.successDot}>
              <Text style={styles.successTick}>✓</Text>
            </View>
            <Text style={[styles.cardTitle, CARD_TITLE]}>{selectedActivity.title}</Text>
            <PrimaryButton label="Back Home" onPress={restart} style={styles.buttonSpacing} />
            <PrimaryButton label="Restart" onPress={start} variant="secondary" style={styles.buttonSpacingSmall} />
          </>
        ) : null}
      </GlassPanel>

      <GlassPanel style={styles.column}>
        <Text style={[styles.screenTitle, SCREEN_TITLE]}>THINGS TO GRAB</Text>
        <Text style={[styles.body, styles.subtitleSpacing, BODY]}>{selectedActivity.title}</Text>
        <View style={styles.listWrap}>
          {selectedActivity.checklist.map((item, index) => (
            <ChecklistItem
              key={item}
              label={item}
              checked={Boolean(checks[index])}
              onToggle={() =>
                setChecks((current) => current.map((value, currentIndex) => (currentIndex === index ? !value : value)))
              }
            />
          ))}
        </View>
      </GlassPanel>
    </>
  );

  return (
    <LinearGradient colors={["#E8EDFF", "#D6E2FF", "#C9D0FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bg}>
      <View style={styles.overlayGlowA} />
      <View style={styles.overlayGlowB} />
      <ScrollView contentContainerStyle={[styles.page, isWide ? styles.pageWide : styles.pageNarrow]}>
        <View style={[styles.layout, isWide ? styles.layoutWide : styles.layoutNarrow]}>{content}</View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  page: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  pageWide: {
    justifyContent: "center",
  },
  pageNarrow: {
    justifyContent: "flex-start",
  },
  layout: {
    gap: 14,
    width: "100%",
    alignSelf: "center",
  },
  layoutWide: {
    maxWidth: 1320,
    flexDirection: "row",
    alignItems: "stretch",
  },
  layoutNarrow: {
    maxWidth: 760,
    flexDirection: "column",
  },
  column: {
    flex: 1,
    minHeight: 300,
  },
  centerColumn: {
    flex: 1.2,
    minHeight: 420,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  panelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  screenTitle: {
    color: "#6154D0",
    textTransform: "uppercase",
  },
  addButton: {
    color: "#4C3EC0",
    fontSize: 16,
    fontWeight: "600",
  },
  cardTitle: {
    color: "#5648C7",
    marginBottom: 8,
  },
  body: {
    color: "#7C72D8",
    textAlign: "center",
  },
  subtitleSpacing: {
    textAlign: "left",
    marginTop: 2,
    marginBottom: 10,
  },
  listWrap: {
    marginTop: 4,
  },
  mainIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.64)",
    marginBottom: 14,
  },
  mainTitle: {
    color: "#4D40BD",
    textAlign: "center",
  },
  durationBlock: {
    width: "100%",
    marginTop: 18,
    marginBottom: 18,
  },
  buttonSpacing: {
    width: "100%",
    marginTop: 10,
  },
  buttonSpacingSmall: {
    width: "100%",
    marginTop: 10,
  },
  timerText: {
    color: "#4D40BD",
    marginTop: 16,
    marginBottom: 8,
  },
  runningButtons: {
    width: "100%",
    marginTop: 22,
    gap: 10,
  },
  runningButton: {
    width: "100%",
  },
  successDot: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#12D79E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 14,
    shadowColor: "#0DB783",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  successTick: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "700",
    marginTop: -2,
  },
  overlayGlowA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(179, 163, 255, 0.45)",
    top: -60,
    left: -50,
  },
  overlayGlowB: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(162, 196, 255, 0.4)",
    bottom: -80,
    right: -70,
  },
});
