import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const role = user?.role || "tenant";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const renderTenantDashboard = () => (
    <View className="flex-row flex-wrap gap-3">
      <StatCard title="Upcoming Rent" value="$450" icon="wallet" color="#3B82F6" subtitle="Due in 3 days" />
      <StatCard title="Outstanding Bills" value="$128" icon="receipt" color="#F59E0B" />
      <StatCard title="Maintenance" value="2" icon="construct" color="#8B5CF6" subtitle="Active requests" />
      <StatCard title="Messages" value="3" icon="chatbubbles" color="#10B981" subtitle="Unread" />
    </View>
  );

  const renderLandlordDashboard = () => (
    <View className="flex-row flex-wrap gap-3">
      <StatCard title="Monthly Income" value="$4,500" icon="trending-up" color="#10B981" />
      <StatCard title="Outstanding Rent" value="$900" icon="alert-circle" color="#EF4444" />
      <StatCard title="Properties" value="3" icon="home" color="#3B82F6" subtitle="Active" />
      <StatCard title="Maintenance" value="5" icon="construct" color="#F59E0B" subtitle="Open requests" />
    </View>
  );

  const renderManagerDashboard = () => (
    <View className="flex-row flex-wrap gap-3">
      <StatCard title="Occupancy Rate" value="92%" icon="people" color="#10B981" />
      <StatCard title="Inspections Due" value="2" icon="clipboard" color="#8B5CF6" subtitle="This month" />
      <StatCard title="Properties" value="12" icon="business" color="#3B82F6" />
      <StatCard title="Maintenance" value="8" icon="construct" color="#F59E0B" subtitle="In progress" />
    </View>
  );

  const dashboardMap: Record<string, () => JSX.Element> = {
    tenant: renderTenantDashboard,
    flatmate: renderTenantDashboard,
    landlord: renderLandlordDashboard,
    property_manager: renderManagerDashboard,
    contractor: () => (
      <View className="flex-row flex-wrap gap-3">
        <StatCard title="Active Jobs" value="4" icon="hammer" color="#3B82F6" />
        <StatCard title="Completed" value="28" icon="checkmark-circle" color="#10B981" subtitle="This month" />
      </View>
    ),
    admin: renderManagerDashboard,
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-6">
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            {greeting()},
          </Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>
            {user?.first_name} {user?.last_name}
          </Text>
        </View>

        {dashboardMap[role]?.()}

        <Text className="text-lg font-semibold mt-8 mb-4" style={{ color: colors.text }}>
          Quick Actions
        </Text>

        <View className="gap-3 mb-8">
          {[
            { icon: "add-circle" as const, label: "Submit Maintenance", color: "#3B82F6" },
            { icon: "card" as const, label: "Pay Rent", color: "#10B981" },
            { icon: "chatbubble" as const, label: "Message Landlord", color: "#8B5CF6" },
            { icon: "calendar" as const, label: "View Calendar", color: "#F59E0B" },
          ].map((action) => (
            <Card key={action.label} className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: action.color + "20" }}
              >
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>
              <Text className="text-base font-medium flex-1" style={{ color: colors.text }}>
                {action.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
