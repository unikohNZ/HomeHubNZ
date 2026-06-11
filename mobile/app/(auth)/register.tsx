import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["tenant", "landlord", "flatmate", "contractor"]),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "tenant" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await register(data as Record<string, string>);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Registration Failed", "Could not create account. Email may already be in use.");
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
      <ScrollView contentContainerClassName="px-6 py-12">
        <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
          Create Account
        </Text>
        <Text className="text-base mb-8" style={{ color: colors.textSecondary }}>
          Join HomeHub NZ today
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="First Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.first_name?.message} />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Last Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.last_name?.message} />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Password" secureTextEntry value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input label="Phone (optional)" keyboardType="phone-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
          )}
        />

        <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} className="mt-4" />

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Text className="font-semibold" style={{ color: colors.primary }}>Sign In</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
