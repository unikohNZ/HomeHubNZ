import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { AppCard, LoadingSpinner, PrimaryButton, ScreenHeader, StatCard, StatusBadge } from "@/components";
import { useRentPayments } from "@/hooks/useMockData";
import { RentPayment } from "@/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function RentTrackerScreen() {
  const { colors } = useTheme();
  const { data: payments, isLoading } = useRentPayments();

  const pending =
    payments?.filter((p: RentPayment) => p.status === "pending" || p.status === "overdue") ?? [];
  const outstanding = pending.reduce((sum: number, p: RentPayment) => sum + p.amount, 0);
  const nextDue = [...pending].sort((a: RentPayment, b: RentPayment) =>
    a.due_date.localeCompare(b.due_date),
  )[0];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        <LoadingSpinner fullScreen message="Loading rent data..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Rent Tracker" subtitle="Weekly rent payments in NZD" />

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard
            title="Next Due"
            value={nextDue ? `$${nextDue.amount}` : "$0"}
            icon="calendar"
            color="#3B82F6"
            subtitle={nextDue ? formatDate(nextDue.due_date) : "All caught up"}
          />
          <StatCard
            title="Outstanding"
            value={`$${outstanding}`}
            icon="alert-circle"
            color={outstanding > 0 ? "#F87171" : "#34D399"}
            subtitle={outstanding > 0 ? `${pending.length} payment(s)` : "No arrears"}
          />
        </View>

        <PrimaryButton title="Record Payment" onPress={() => {}} className="mb-8" />

        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
          Payment History
        </Text>

        {payments?.map((payment: RentPayment) => (
          <AppCard key={payment.id} className="mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  ${payment.amount}
                  <Text className="text-sm font-normal" style={{ color: colors.textSecondary }}>
                    {" "}
                    NZD
                  </Text>
                </Text>
                <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                  Due: {formatDate(payment.due_date)}
                </Text>
                {payment.payment_date && (
                  <Text className="text-xs mt-1" style={{ color: colors.success }}>
                    Paid: {formatDate(payment.payment_date)}
                  </Text>
                )}
              </View>
              <StatusBadge status={payment.status} />
            </View>
          </AppCard>
        ))}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
