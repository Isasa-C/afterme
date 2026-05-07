import { Pressable, StyleSheet, Text, View } from "react-native";

type ChecklistItemProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export default function ChecklistItem({ label, checked, onToggle }: ChecklistItemProps) {
  return (
    <Pressable onPress={onToggle} style={[styles.row, checked && styles.rowChecked]}>
      <View style={[styles.dot, checked && styles.dotChecked]}>{checked ? <Text style={styles.tick}>✓</Text> : null}</View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.52)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rowChecked: {
    backgroundColor: "rgba(221, 255, 245, 0.86)",
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(114, 100, 216, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dotChecked: {
    backgroundColor: "#12D79E",
  },
  tick: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  label: {
    flex: 1,
    color: "#5A4DCA",
    fontSize: 13,
    fontWeight: "500",
  },
  labelChecked: {
    color: "#4A40AF",
  },
});
