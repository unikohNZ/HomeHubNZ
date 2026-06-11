import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const MENU_ITEMS = [
  { icon: "calendar" as const, label: "Calendar", route: "/calendar" },
  { icon: "receipt" as const, label: "Bills & Expenses", route: "/bills" },
  { icon: "notifications" as const, label: "Notifications", route: "/notifications" },
  { icon: "sparkles" as const, label: "AI Assistant", route: "/ai-assistant" },
  { icon: "person" as const, label: "Profile", route: "/profile" },
  { icon: "settings" as const, label: "Settings", route: "/settings" },
];

export default function MoreScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold pt-4 pb-6" style={{ color: colors.text }}>More</Text>

        <Card className="flex-row items-center mb-6">
          <View
            className="w-14 h-14 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-xl font-bold text-white">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.text }}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text className="text-sm capitalize" style={{ color: colors.textSecondary }}>
              {user?.role?.replace("_", " ")}
            </Text>
          </View>
        </Card>

        <View className="gap-1 mb-6">
          {MENU_ITEMS.map((item) => (
            <Pressable key={item.label}>
              <Card className="flex-row items-center mb-1 py-3.5">
                <Ionicons name={item.icon} size={22} color={colors.primary} style={{ marginRight: 14 }} />
                <Text className="text-base flex-1" style={{ color: colors.text }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Card>
            </Pressable>
          ))}
        </View>

        <Card className="mb-6">
          <Text className="text-base font-semibold mb-3" style={{ color: colors.text }}>Appearance</Text>
          <View className="flex-row gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTheme(t)}
                className="flex-1 py-2.5 rounded-xl items-center"
                style={{
                  backgroundColor: theme === t ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  className="text-sm font-medium capitalize"
                  style={{ color: theme === t ? "#FFFFFF" : colors.text }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button title="Sign Out" variant="danger" onPress={handleLogout} />
        <Text className="text-center text-xs mt-6 mb-8" style={{ color: colors.textSecondary }}>
          HomeHub NZ v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
