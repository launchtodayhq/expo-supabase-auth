import { SafeAreaView } from "@/components/SafeAreaView";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";
import { useSession } from "@/providers";
import AppleSignIn from "./components/apple-sign-in";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";

export default function SignIn() {
  const { signInWithApple } = useSession();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <Animated.View
          entering={FadeInDown.duration(800)}
          style={styles.titleContainer}
        >
          <ThemedText style={styles.title}>Expo Auth</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in with Apple or Google
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.buttonContainer}
        >
          <AppleSignIn style={styles.button} onSignIn={signInWithApple} />
        </Animated.View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 38,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 20,
    textAlign: "center",
  },
  buttonContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  button: {
    width: "100%",
    height: 44,
  },
});
