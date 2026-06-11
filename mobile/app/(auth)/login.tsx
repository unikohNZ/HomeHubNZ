import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AppInput, PrimaryButton } from "@/components";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "sarah.mitchell@example.co.nz", password: "password123" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="home" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
            HomeHub NZ
          </Text>
          <Text className="text-base mt-2 text-center" style={{ color: colors.textSecondary }}>
            Smart property management for New Zealand
          </Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Email"
              placeholder="you@example.co.nz"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <PrimaryButton title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />

        <Text className="text-xs text-center mt-4" style={{ color: colors.textSecondary }}>
          Demo mode — any valid email and password will work
        </Text>

        <View className="flex-row justify-center mt-8">
          <Text style={{ color: colors.textSecondary }}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <Text className="font-semibold" style={{ color: colors.primary }}>
              Sign Up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
