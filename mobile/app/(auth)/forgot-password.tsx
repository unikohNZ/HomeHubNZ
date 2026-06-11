import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "@/context/ThemeContext";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({ email: z.string().email("Invalid email address") });

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      Alert.alert("Check Your Email", "If an account exists, a reset link has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-6 justify-center" style={{ backgroundColor: colors.background }}>
      <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Reset Password</Text>
      <Text className="text-base mb-8" style={{ color: colors.textSecondary }}>
        Enter your email and we'll send you a reset link.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
        )}
      />

      <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} />
      <Button title="Back to Login" variant="outline" onPress={() => router.back()} className="mt-3" />
    </View>
  );
}
