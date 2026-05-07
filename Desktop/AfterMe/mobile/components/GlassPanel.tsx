import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  style?: object;
};

export default function GlassPanel({ children, style }: GlassPanelProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={36} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.34)",
    shadowColor: "#6A62CC",
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  blur: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
