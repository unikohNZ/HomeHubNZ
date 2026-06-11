import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AppCard, LoadingSpinner, StatCard } from "@/components";
import { useDashboard, useMaintenance, useNotifications } from "@/hooks/useMockData";
import { MOCK_PROPERTIES } from "@/data/mockData";
import { MaintenanceRequest, Notification } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { data: dashboard, isLoading } = useDashboard();
  const { data: maintenance } = useMaintenance();
  const { data: notifications } = useNotifications();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <LoadingSpinner fullScreen message="Loading dashboard..." />
      </SafeAreaView>
    );
  }

  const upcomingRent = dashboard?.upcomingRent;
  const outstandingMaintenance =
    maintenance?.filter((r: MaintenanceRequest) => r.status !== "completed") ?? [];
  const recentNotifications = notifications?.slice(0, 4) ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-2">
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            {greeting()},
          </Text>
          <Text className="text-3xl font-bold mt-1 tracking-tight" style={{ color: colors.text }}>
            {user?.first_name} {user?.last_name}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: colors.primaryMuted }}>
              <Text className="text-xs font-semibold capitalize" style={{ color: colors.primary }}>
                {user?.role?.replace(/_/g, " ")}
              </Text>
            </View>
            <Text className="text-xs ml-2" style={{ color: colors.textSecondary }}>
              New Zealand
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-4">
          <StatCard
            title="Upcoming Rent"
            value={upcomingRent ? `$${upcomingRent.amount}` : "—"}
            icon="wallet"
            color="#3B82F6"
            subtitle={upcomingRent ? `Due ${formatDate(upcomingRent.due_date)}` : undefined}
          />
          <StatCard
            title="Active Properties"
            value={String(dashboard?.activeProperties ?? 0)}
            icon="home"
            color="#34D399"
            subtitle="Across NZ"
          />
          <StatCard
            title="Outstanding Maintenance"
            value={String(dashboard?.maintenanceCount ?? 0)}
            icon="construct"
            color="#FBBF24"
            subtitle="Open requests"
          />
          <StatCard
            title="Monthly Income"
            value={`$${(dashboard?.monthlyIncome ?? 0).toLocaleString()}`}
            icon="trending-up"
            color="#A78BFA"
            trend="+4.2%"
          />
        </View>

        <Text className="text-lg font-bold mt-8 mb-3" style={{ color: colors.text }}>
          Upcoming Rent
        </Text>
        {upcomingRent ? (
          <AppCard elevated className="mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {MOCK_PROPERTIES[0]?.address_line1}
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  {MOCK_PROPERTIES[0]?.suburb}, {MOCK_PROPERTIES[0]?.city}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                  ${upcomingRent.amount}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.warning }}>
                  Due {formatDate(upcomingRent.due_date)}
                </Text>
              </View>
            </View>
          </AppCard>
        ) : (
          <AppCard className="mb-6">
            <Text style={{ color: colors.textSecondary }}>No upcoming rent payments</Text>
          </AppCard>
        )}

        <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
          Outstanding Maintenance
        </Text>
        <View className="gap-3 mb-6">
          {outstandingMaintenance.slice(0, 3).map((item: MaintenanceRequest) => (
            <AppCard key={item.id}>
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: colors.warning + "22" }}
                >
                  <Ionicons name="construct" size={20} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {item.title}
                  </Text>
                  <Text className="text-xs mt-0.5 capitalize" style={{ color: colors.textSecondary }}>
                    {item.priority} priority · {item.status.replace(/_/g, " ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </AppCard>
          ))}
        </View>

        <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
          Recent Notifications
        </Text>
        <View className="gap-3 mb-10">
          {recentNotifications.map((notification: Notification) => (
            <AppCard key={notification.id} elevated={!notification.is_read}>
              <View className="flex-row items-start">
                <View
                  className="w-2 h-2 rounded-full mt-2 mr-3"
                  style={{ backgroundColor: notification.is_read ? "transparent" : colors.primary }}
                />
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                    {notification.title}
                  </Text>
                  <Text className="text-xs mt-1 leading-5" style={{ color: colors.textSecondary }}>
                    {notification.body}
                  </Text>
                  <Text className="text-xs mt-2" style={{ color: colors.textSecondary }}>
                    {timeAgo(notification.created_at)}
                  </Text>
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
