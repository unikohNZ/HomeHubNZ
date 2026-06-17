import { Platform } from "react-native";

/** Native driver is unsupported for opacity/transform on React Native Web. */
export const USE_NATIVE_DRIVER = Platform.OS !== "web";
