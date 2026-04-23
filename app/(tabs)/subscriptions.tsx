import SubscriptionCard from "@/components/SubscriptionCard";
import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  useEffect(() => {
    posthog?.screen("Subscriptions");
  }, [posthog]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      posthog?.identify(user.id, {
        user_id: user.id,
      });
    }
  }, [isLoaded, isSignedIn, user, posthog]);

  const filteredSubscriptions = subscriptions.filter(
    (subscription) =>
      subscription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subscription.plan?.toLowerCase() || "").includes(
        searchQuery.toLowerCase(),
      ),
  );

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerClassName="p-5 pb-32"
        >
          <Text className="text-xl font-bold mb-6 text-center">
            Subscriptions
          </Text>

          {/* Search Bar */}
          <View className="mb-4">
            <View
              className="flex-row items-center bg-card rounded-xl px-4 py-3"
              style={{ borderColor: "#C6BFA2", borderWidth: 1 }}
            >
              <TextInput
                className="flex-1 text-base"
                placeholder="Search subscriptions..."
                placeholderTextColor="#666666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Results Count */}
          {searchQuery && (
            <Text className="text-sm text-gray-500 mb-4">
              {filteredSubscriptions.length} result
              {filteredSubscriptions.length !== 1 ? "s" : ""} found
            </Text>
          )}

          {/* Subscription List */}
          <FlatList
            data={filteredSubscriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SubscriptionCard
                {...item}
                icon={
                  item.icon && (icons as any)[item.icon]
                    ? (icons as any)[item.icon]
                    : icons.wallet
                }
                billing={item.frequency}
                plan={item.plan || "Custom"}
                expanded={expandedSubscriptionId === item.id}
                onPress={() => {
                  setExpandedSubscriptionId((currentId) => {
                    const isExpanding = currentId !== item.id;
                    posthog?.capture(
                      isExpanding
                        ? "subscription_expanded"
                        : "subscription_collapsed",
                      {
                        subscription_id: item.id,
                        subscription_name: item.name,
                      },
                    );
                    return currentId === item.id ? null : item.id;
                  });
                }}
              />
            )}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-10">
                {searchQuery
                  ? "No subscriptions match your search."
                  : "No subscriptions yet."}
              </Text>
            }
            contentContainerClassName="pb-30"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
