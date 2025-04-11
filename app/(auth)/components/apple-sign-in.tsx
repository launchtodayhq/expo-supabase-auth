import * as AppleAuthentication from "expo-apple-authentication";
import { useColorScheme, ViewStyle } from "react-native";

export default function AppleSignIn({
  style,
  onSignIn,
}: {
  style: ViewStyle;
  onSignIn: (setIsLoading: (value: boolean) => void) => void;
}) {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={
        isDarkMode
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={5}
      style={style}
      onPress={() => onSignIn(() => {})}
    />
  );
}
