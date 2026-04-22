import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

function ClerkLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}

function PostHogLifecycle() {
  const posthog = usePostHog();
  const appState = useRef(AppState.currentState);
  const hasCapturedApplicationOpenRef = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          posthog?.capture("application_became_active");
        } else if (nextAppState === "background") {
          posthog?.capture("application_background");
        }
        appState.current = nextAppState;
      },
    );

    // Track application open on mount (only once per session)
    if (!hasCapturedApplicationOpenRef.current) {
      posthog?.capture("application_open");
      hasCapturedApplicationOpenRef.current = true;
    }

    return () => {
      subscription.remove();
    };
  }, [posthog]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn("Failed to prevent splash screen auto-hide:", e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SubscriptionsProvider>
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim()}
        options={{
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim(),
          flushAt: 1,
          flushInterval: 10000,
        }}
      >
        <ClerkLayout>
          <PostHogLifecycle />
          <Stack screenOptions={{ headerShown: false }} />
        </ClerkLayout>
      </PostHogProvider>
    </SubscriptionsProvider>
  );
}
