import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AppInput, PrimaryButton } from "@/components";
import { UserRole } from "@/types";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "tenant", label: "Tenant" },
  { value: "landlord", label: "Landlord" },
  { value: "flatmate", label: "Flatmate" },
  { value: "contractor", label: "Contractor" },
];

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["tenant", "landlord", "flatmate", "contractor"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "tenant" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await register(data);
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
        contentContainerClassName="px-6 py-12"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
          Create Account
        </Text>
        <Text className="text-base mb-8 mt-2" style={{ color: colors.textSecondary }}>
          Join HomeHub NZ — manage properties across Aotearoa
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="First Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.first_name?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Last Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.last_name?.message}
                />
              )}
            />
          </View>
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
              secureTextEntry
              hint="Minimum 8 characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Phone (optional)"
              placeholder="+64 21 000 0000"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <Text className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          I am a...
        </Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {ROLES.map((role) => (
                <Pressable
                  key={role.value}
                  onPress={() => onChange(role.value)}
                  className="px-4 py-2.5 rounded-xl"
                  style={{
                    backgroundColor: value === role.value ? colors.primary : colors.surface,
                    borderColor: value === role.value ? colors.primary : colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: value === role.value ? "#FFFFFF" : colors.text }}
                  >
                    {role.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        />

        <PrimaryButton title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-2" />

        <View className="flex-row justify-center mt-8 mb-6">
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="font-semibold" style={{ color: colors.primary }}>
              Sign In
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
