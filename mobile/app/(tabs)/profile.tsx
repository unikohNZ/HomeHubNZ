import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AppCard, PrimaryButton, ScreenHeader } from "@/components";

const MENU_ITEMS = [
  { icon: "person-outline" as const, label: "Edit Profile", color: "#3B82F6" },
  { icon: "notifications-outline" as const, label: "Notifications", color: "#A78BFA" },
  { icon: "document-text-outline" as const, label: "Documents", color: "#34D399" },
  { icon: "shield-checkmark-outline" as const, label: "Privacy & Security", color: "#FBBF24" },
  { icon: "help-circle-outline" as const, label: "Help & Support", color: "#60A5FA" },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profile" subtitle="Your HomeHub NZ account" />

        <AppCard elevated className="items-center mb-6 py-6">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-2xl font-bold text-white">{initials}</Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            {user?.email}
          </Text>
          <View className="px-3 py-1 rounded-full mt-3" style={{ backgroundColor: colors.primaryMuted }}>
            <Text className="text-xs font-semibold capitalize" style={{ color: colors.primary }}>
              {user?.role?.replace(/_/g, " ")}
            </Text>
          </View>
          {user?.phone && (
            <Text className="text-sm mt-3" style={{ color: colors.textSecondary }}>
              {user.phone}
            </Text>
          )}
        </AppCard>

        <AppCard className="mb-6">
          <Text className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
            Appearance
          </Text>
          <View className="flex-row gap-2">
            {(["dark", "light", "system"] as const).map((option) => (
              <PrimaryButton
                key={option}
                title={option.charAt(0).toUpperCase() + option.slice(1)}
                size="sm"
                variant={theme === option ? "primary" : "secondary"}
                onPress={() => setTheme(option)}
                className="flex-1"
              />
            ))}
          </View>
          <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
            Currently using {isDark ? "dark" : "light"} mode
          </Text>
        </AppCard>

        <View className="gap-3 mb-8">
          {MENU_ITEMS.map((item) => (
            <AppCard key={item.label}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: item.color + "22" }}
                >
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </AppCard>
          ))}
        </View>

        <PrimaryButton title="Sign Out" variant="danger" onPress={handleLogout} className="mb-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
