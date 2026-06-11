import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

const MOCK_PAYMENTS = [
  { id: 1, amount: 450, due_date: "2026-06-15", status: "pending" as const },
  { id: 2, amount: 450, due_date: "2026-06-08", status: "paid" as const, payment_date: "2026-06-07" },
  { id: 3, amount: 450, due_date: "2026-06-01", status: "paid" as const, payment_date: "2026-05-31" },
  { id: 4, amount: 450, due_date: "2026-05-25", status: "overdue" as const },
];

export default function RentScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold pt-4 pb-6" style={{ color: colors.text }}>Rent Tracker</Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatCard title="Next Due" value="$450" icon="calendar" color="#3B82F6" subtitle="Jun 15, 2026" />
          <StatCard title="Outstanding" value="$450" icon="alert-circle" color="#EF4444" />
        </View>

        <Button title="Upload Payment Receipt" onPress={() => {}} className="mb-6" />

        <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Payment History</Text>

        {MOCK_PAYMENTS.map((payment) => (
          <Card key={payment.id} className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold" style={{ color: colors.text }}>
                ${payment.amount}
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                Due: {payment.due_date}
              </Text>
              {payment.payment_date && (
                <Text className="text-xs mt-0.5" style={{ color: colors.success }}>
                  Paid: {payment.payment_date}
                </Text>
              )}
            </View>
            <StatusBadge status={payment.status} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
