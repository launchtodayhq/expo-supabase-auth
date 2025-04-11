import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";
import { TouchableOpacity, useColorScheme } from "react-native";

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
        },
        headerTintColor: isDarkMode ? "#ffffff" : "#000000",
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Dashboard",
          headerLargeTitle: true,
          headerLargeStyle: {
            backgroundColor: isDarkMode ? "#000000" : "#ffffff",
          },
        }}
      />
    </Stack>
  );
}
