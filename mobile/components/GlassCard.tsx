import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type GlassCardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.78)", "rgba(255,255,255,0.38)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 28,
    shadowColor: "#5BABF0",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8
  },
  card: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 28,
    overflow: "hidden"
  }
});
