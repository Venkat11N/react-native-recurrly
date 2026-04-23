import images from "@/constants/images";
import { useAuth, useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const posthog = usePostHog();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    posthog?.screen("Settings");
  }, [posthog]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      posthog?.capture("sign_out_attempted");
      await signOut();
      posthog?.capture("sign_out_success");
      posthog?.capture("user_signed_out", {
        signed_out: true,
      });
      try {
        posthog?.reset();
      } catch (resetError) {
        console.error("PostHog reset error:", resetError);
      }
      router.replace("/(auth)/sign-in");
    } catch (error) {
      posthog?.capture("sign_out_failed", {
        error: (error as Error).message,
      });
      Alert.alert("Error", "Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isLoaded || !isSignedIn || isSigningOut) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold mb-6 text-center">Settings</Text>

      {/* Profile Section */}
      <View
        className="bg-card p-5 rounded-2xl mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center mb-3">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="w-20 h-20 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: "#081226" }}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "User"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Details */}
      <View
        className="bg-card p-5 rounded-2xl mb-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-lg font-bold mb-4" style={{ color: "#081226" }}>
          Account
        </Text>
        <View className="mb-4">
          <Text className="text-gray-500 text-sm mb-1">Account ID</Text>
          <Text className="text-sm font-medium" style={{ color: "#081226" }}>
            {user?.id || ""}
          </Text>
        </View>
        <View>
          <Text className="text-gray-500 text-sm mb-1">Joined</Text>
          <Text className="text-sm font-medium" style={{ color: "#081226" }}>
            {user?.createdAt
              ? dayjs(user.createdAt).format("MMMM DD, YYYY")
              : ""}
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        disabled={isSigningOut}
        className="p-4 rounded-2xl"
        style={{
          backgroundColor: "#EA7A53",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-white text-center font-semibold text-base">
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
