import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Starting HomeHub NZ..." />;
  }

  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
