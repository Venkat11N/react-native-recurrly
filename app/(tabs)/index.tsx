import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
    HOME_BALANCE,
    HOME_USER,
    type Subscription
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import "@/global.css";
import { useAuth, useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "../../lib/utils";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const posthog = usePostHog();
  const { subscriptions, addSubscription } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    posthog?.screen("Home");
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

  const handleSubscriptionCreated = (newSubscription: Subscription) => {
    addSubscription(newSubscription);
  };

  const upcomingSubscriptions = subscriptions
    .filter((sub) => sub.status === "active")
    .map((sub) => {
      const renewalDate = new Date(sub.renewalDate);
      const today = new Date();
      const daysLeft = Math.ceil(
        (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: sub.id,
        icon: sub.icon,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
      };
    })
    .filter((sub) => sub.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (!isLoaded || !isSignedIn) {
    return null;
  }
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.primaryEmailAddress?.emailAddress || HOME_USER.name}
                </Text>
              </View>
              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home_empty-state">
                    No upcoming subscriptions renewals yet.
                  </Text>
                }
              />
            </View>
            <ListHeading title="All Subscription" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
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
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubscriptionCreated={handleSubscriptionCreated}
      />
    </SafeAreaView>
  );
}
