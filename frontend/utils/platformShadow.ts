import { Platform, ViewStyle } from "react-native";

type NativeShadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

/** Web uses boxShadow; iOS/Android keep shadow* + elevation. */
export function platformShadow(webBoxShadow: string, native: NativeShadow): ViewStyle {
  if (Platform.OS === "web") {
    return { boxShadow: webBoxShadow };
  }
  return native;
}
