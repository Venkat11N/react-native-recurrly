import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold mb-6">Settings</Text>

      {/* Profile Section */}
      <View className="bg-card p-4 rounded-xl mb-4">
        <View className="flex-row items-center mb-4">
          <Image
            source={{ uri: user?.imageUrl || images.avatar }}
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
        onPress={() => signOut()}
        className="bg-red-500 p-4 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
