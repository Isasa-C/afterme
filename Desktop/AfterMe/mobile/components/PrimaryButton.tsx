import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
};

export default function PrimaryButton({ label, onPress, style, variant = "primary" }: PrimaryButtonProps) {
  if (variant === "secondary") {
    return (
      <Pressable onPress={onPress} style={[styles.secondary, style]}>
        <Text style={styles.secondaryLabel}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={style}>
      <LinearGradient colors={["#6E63DC", "#4C3BC1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
        <Text style={styles.primaryLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#5649C7",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondary: {
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.56)",
  },
  secondaryLabel: {
    color: "#4E41BF",
    fontSize: 17,
    fontWeight: "600",
  },
});
