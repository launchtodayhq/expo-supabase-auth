import { Redirect } from "expo-router";
import { useSession } from "@/providers";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(dashboard)" />;
  }

  return <Redirect href="/(auth)" />;
}
