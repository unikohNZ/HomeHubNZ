import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { authColors } from "./authTheme";

interface AuthInputFieldProps extends TextInputProps {
  icon: string;
  label: string;
}

export function AuthInputField({ icon, label, style, ...props }: AuthInputFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Text style={styles.icon}>{icon}</Text>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={authColors.placeholder}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: authColors.label,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 58,
    backgroundColor: authColors.inputBg,
    borderWidth: 1.5,
    borderColor: authColors.inputBorder,
    borderRadius: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  icon: {
    fontSize: 18,
    width: 24,
    textAlign: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: authColors.navy,
    height: "100%",
    paddingVertical: 0,
  },
});
