import * as AppleAuthentication from "expo-apple-authentication";

import React, { useCallback, useEffect } from "react";

import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { router } from "expo-router";

import { createSessionFromUrl } from "@/utils/createSessionFromUrl";
import { useStorageState } from "@/hooks/useStorageState";
import { supabase } from "@/services/index";

const extractSessionData = (session: Session) => {
  if (!session) return null;

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    user: {
      id: session.user.id,
      email: session.user.email,
    },
  };
};

WebBrowser.maybeCompleteAuthSession();
const redirectTo = makeRedirectUri();

const AuthContext = React.createContext<{
  signInWithApple: (setIsLoading: (value: boolean) => void) => void;
  signInWithGoogle: (setIsLoading: (value: boolean) => void) => void;
  signOut: () => void;
  session: Session | null;
  isLoading: boolean;
  user: User | null;
}>({
  signInWithApple: () => null,
  signInWithGoogle: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  user: null,
});

export function useSession() {
  const value = React.useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[storageLoading, storageValue], setStorageValue] =
    useStorageState("session");
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const isLoading = storageLoading || isInitializing;

  useEffect(() => {
    if (Platform.OS === "web") {
      console.info("Skipping loading session for web");
      setIsInitializing(false);
      return;
    }

    async function initializeSession() {
      try {
        if (storageValue) {
          const parsedSession = JSON.parse(storageValue);

          if (parsedSession.access_token && parsedSession.refresh_token) {
            await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token,
            });

            const { data, error } = await supabase.auth.getSession();

            if (error) {
              console.error("Error restoring session:", error);
              setStorageValue(null);
            } else if (data?.session) {
              setSession(data.session);
              setUser(data.session.user);
            }
          }
        }
      } catch (error) {
        console.error("Error loading session:", error);
        setStorageValue(null);
      } finally {
        setIsInitializing(false);
      }
    }

    if (!storageLoading) {
      initializeSession();
    }
  }, [storageLoading, storageValue]);

  useEffect(() => {
    const response = supabase?.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (newSession) {
            // Only store essential session data
            const essentialData = extractSessionData(newSession);
            const sessionString = JSON.stringify(essentialData);
            setStorageValue(sessionString);
            setSession(newSession);
            setUser(newSession.user);
          }
        } else if (event === "SIGNED_OUT") {
          setStorageValue(null);
          setSession(null);
          setUser(null);
        }
      }
    );

    return () => {
      if (response) {
        response.data.subscription.unsubscribe();
      }
    };
  }, []);

  async function performAppleOAuth(setIsLoading: (value: boolean) => void) {
    try {
      setIsLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        console.error(
          "performAppleOAuth - error - Could not get identityToken from credential"
        );
        return;
      }

      const response = await supabase?.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (response?.error) {
        console.error(
          "performAppleOAuth - error - error completing sign in with Apple"
        );

        throw {
          message: "Supabase Apple Sign In failed",
          originalError: response.error,
        };
      }

      if (!response?.data.session) {
        console.error(
          "performAppleOAuth - error - could not find session in response.data object"
        );

        return;
      }

      // Only store essential session data
      const essentialData = extractSessionData(response.data.session);
      const sessionString = JSON.stringify(essentialData);
      setStorageValue(sessionString);
      setSession(response.data.session);
      setUser(response.data.session.user);
      setIsLoading(false);

      // Navigate to dashboard after successful sign-in
      router.replace("/(dashboard)");
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      console.error(
        "performAppleOAuth - error - there was a problem signing in the user with Apple",
        error
      );
    }
  }

  async function performGoogleOAuth(setIsLoading: (value: boolean) => void) {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "com.launchtoday.expo://login-callback",
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "select_account consent",
          },
        },
      });

      if (error) {
        console.error(
          "performGoogleOAuth - error - error completing sign in with Google"
        );
        return;
      }

      const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? "",
        redirectTo
      );

      if (res.type === "cancel") {
        setIsLoading(false);
        return;
      }

      if (res.type === "success") {
        const { url } = res;
        const newSession = await createSessionFromUrl(url);

        if (newSession) {
          // Only store essential session data
          const essentialData = extractSessionData(newSession);
          const sessionString = JSON.stringify(essentialData);
          setStorageValue(sessionString);
          setSession(newSession);
          setUser(newSession.user);

          // Navigate to dashboard after successful sign-in
          router.replace("/(dashboard)");
        }

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(
        "performGoogleOAuth - error - there was a problem signing in the user with Google"
      );
    }
  }

  async function performSignOut() {
    try {
      // Start the sign out process with Supabase
      const response = await supabase?.auth.signOut();

      if (response?.error) {
        console.error(
          "performSignOut - could not sign out user",
          response.error
        );

        return;
      }

      // Navigate to auth screen first
      router.replace("/(auth)");

      setStorageValue(null);
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error(
        "performSignOut - there was a problem signing out the user"
      );
    }
  }

  const signInWithApple = useCallback(
    (setIsLoading: (value: boolean) => void) => {
      performAppleOAuth(setIsLoading);
    },
    [performAppleOAuth]
  );

  const signInWithGoogle = useCallback(
    (setIsLoading: (value: boolean) => void) => {
      performGoogleOAuth(setIsLoading);
    },
    [performGoogleOAuth]
  );

  const signOut = useCallback(() => {
    performSignOut();
  }, [setSession, performSignOut]);

  const authContextValue = React.useMemo(
    () => ({
      signInWithApple,
      signInWithGoogle,
      signOut,
      session,
      user,
      isLoading,
    }),
    [signInWithApple, signInWithGoogle, signOut, session, isLoading, user]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {props.children}
    </AuthContext.Provider>
  );
}
