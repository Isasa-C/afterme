import { Pressable, StyleSheet, Text, View } from "react-native";

type DurationSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function DurationSelector({ value, onChange, min = 1, max = 180 }: DurationSelectorProps) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.control}>
        <Text style={styles.controlText}>-</Text>
      </Pressable>
      <Text style={styles.value}>{value} min</Text>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.control}>
        <Text style={styles.controlText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.5)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  control: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(217, 208, 255, 0.7)",
  },
  controlText: {
    color: "#4A3DBB",
    fontSize: 23,
    fontWeight: "700",
  },
  value: {
    color: "#4E41BF",
    fontSize: 17,
    fontWeight: "600",
  },
});
