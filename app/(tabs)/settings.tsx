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
      <Text className="text-xl font-bold mb-6">Settings</Text>

      {/* Profile Section */}
      <View className="bg-card p-4 rounded-xl mb-4">
        <View className="flex-row items-center mb-4">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="w-16 h-16 rounded-full mr-4"
          />
          <View>
            <Text className="text-lg font-semibold">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "User"}
            </Text>
            <Text className="text-gray-500 text-sm">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Details */}
      <View className="bg-card p-4 rounded-xl mb-4">
        <Text className="text-lg font-semibold mb-3">Account</Text>
        <View className="mb-3">
          <Text className="text-gray-500 text-sm mb-1">Account ID</Text>
          <Text className="text-sm">{user?.id || ""}</Text>
        </View>
        <View>
          <Text className="text-gray-500 text-sm mb-1">Joined</Text>
          <Text className="text-sm">
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
        className="bg-red-500 p-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
