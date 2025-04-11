import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "@/components/SafeAreaView";
import { useSession } from "@/providers";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  useColorScheme,
} from "react-native";

export default function Dashboard() {
  const { signOut, user } = useSession();
  const theme = useColorScheme();

  // Define button colors based on theme
  const buttonBackground = theme === "dark" ? "#FFFFFF" : "#000000";
  const buttonTextColor = theme === "dark" ? "#000000" : "#FFFFFF";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeText}>Welcome!</ThemedText>
        <ThemedText style={styles.emailText}>{user?.email}</ThemedText>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: buttonBackground }]}
          onPress={signOut}
        >
          <Text style={[styles.logoutButtonText, { color: buttonTextColor }]}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 32,
  },
  emailText: {
    fontSize: 18,
    opacity: 0.8,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    // paddingBottom: 20,
  },
  logoutButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginVertical: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
