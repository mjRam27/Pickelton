// pickelton-app/apps/mobile/src/components/Brand.tsx
import { StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

export function Brand() {
  return <Text style={styles.brand}>PICKELTON</Text>;
}

const styles = StyleSheet.create({
  brand: { color: colors.lime, fontSize: 21, fontStyle: "italic", fontWeight: "900", letterSpacing: 0 },
});
