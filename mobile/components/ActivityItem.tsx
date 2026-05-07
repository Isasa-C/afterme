import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Activity } from "../data/activities";

type ActivityItemProps = {
  activity: Activity;
  active: boolean;
  onPress: () => void;
};

export default function ActivityItem({ activity, active, onPress }: ActivityItemProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, active && styles.active]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={activity.icon as never} size={20} color={active ? "#5142C2" : "#6E61D8"} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, active && styles.activeTitle]}>{activity.title}</Text>
        <Text style={styles.subtitle}>{activity.durationMinutes} min</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 66,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.46)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  active: {
    backgroundColor: "rgba(226, 217, 255, 0.84)",
    shadowColor: "#7B6CE8",
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    marginRight: 10,
  },
  copy: {
    flex: 1,
  },
  title: {
    color: "#5A4DCA",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTitle: {
    color: "#4637B3",
  },
  subtitle: {
    marginTop: 2,
    color: "#857AD9",
    fontSize: 13,
  },
});
