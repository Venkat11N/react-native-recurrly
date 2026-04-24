import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import "@/global.css";
import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

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
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);

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

  const handleSubscriptionCreated = async (
    subscriptionData: Omit<any, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => {
    try {
      await addSubscription(subscriptionData);
    } catch (error) {
      console.error("Failed to create subscription:", error);
      throw error;
    }
  };

  const upcomingSubscriptions = subscriptions
    .filter(
      (sub) =>
        String(sub.status || "active")
          .trim()
          .toLowerCase() === "active",
    )
    .map((sub) => {
      const renewalDate = new Date(sub.renewalDate);
      let nextRenewal = new Date(renewalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        nextRenewal < today &&
        nextRenewal.toDateString() !== today.toDateString()
      ) {
        if (
          String(sub.frequency || "Monthly")
            .trim()
            .toLowerCase() === "monthly"
        ) {
          nextRenewal = new Date(
            today.getFullYear(),
            today.getMonth(),
            renewalDate.getDate(),
          );
          if (
            nextRenewal < today &&
            nextRenewal.toDateString() !== today.toDateString()
          ) {
            nextRenewal.setMonth(nextRenewal.getMonth() + 1);
          }
        } else if (
          String(sub.frequency || "Yearly")
            .trim()
            .toLowerCase() === "yearly"
        ) {
          nextRenewal = new Date(
            today.getFullYear(),
            renewalDate.getMonth(),
            renewalDate.getDate(),
          );
          if (
            nextRenewal < today &&
            nextRenewal.toDateString() !== today.toDateString()
          ) {
            nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
          }
        }
      }

      const daysLeft = Math.ceil(
        (nextRenewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: sub.id,
        icon:
          sub.icon && (icons as any)[sub.icon]
            ? (icons as any)[sub.icon]
            : icons.wallet,
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
      };
    })
    .filter((sub) => sub.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Calculate real balance from subscriptions
  const balanceData = useMemo(() => {
    console.log(
      "Home - Recalculating balance with subscriptions:",
      subscriptions,
    );
    const monthlyTotal = subscriptions
      .filter(
        (sub) =>
          String(sub.status || "active")
            .trim()
            .toLowerCase() === "active" &&
          String(sub.frequency || "Monthly")
            .trim()
            .toLowerCase() === "monthly",
      )
      .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);

    const yearlyTotal = subscriptions
      .filter(
        (sub) =>
          String(sub.status || "active")
            .trim()
            .toLowerCase() === "active" &&
          String(sub.frequency || "Yearly")
            .trim()
            .toLowerCase() === "yearly",
      )
      .reduce((sum, sub) => sum + (Number(sub.price) || 0), 0);

    const totalAmount = monthlyTotal + yearlyTotal;

    console.log(
      "Home - Monthly total:",
      monthlyTotal,
      "Yearly total:",
      yearlyTotal,
      "Total amount:",
      totalAmount,
    );

    // Find next renewal date
    const activeSubscriptions = subscriptions.filter(
      (sub) =>
        String(sub.status || "active")
          .trim()
          .toLowerCase() === "active",
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validDates = activeSubscriptions
      .map((sub) => {
        try {
          const date = new Date(sub.renewalDate);
          if (isNaN(date.getTime())) {
            return null;
          }
          let nextRenewal = new Date(date);
          if (
            nextRenewal < today &&
            nextRenewal.toDateString() !== today.toDateString()
          ) {
            if (
              String(sub.frequency || "Monthly")
                .trim()
                .toLowerCase() === "monthly"
            ) {
              nextRenewal = new Date(
                today.getFullYear(),
                today.getMonth(),
                date.getDate(),
              );
              if (
                nextRenewal < today &&
                nextRenewal.toDateString() !== today.toDateString()
              ) {
                nextRenewal.setMonth(nextRenewal.getMonth() + 1);
              }
            } else if (
              String(sub.frequency || "Yearly")
                .trim()
                .toLowerCase() === "yearly"
            ) {
              nextRenewal = new Date(
                today.getFullYear(),
                date.getMonth(),
                date.getDate(),
              );
              if (
                nextRenewal < today &&
                nextRenewal.toDateString() !== today.toDateString()
              ) {
                nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
              }
            }
          }
          return nextRenewal;
        } catch (error) {
          console.error("Error parsing date:", sub.renewalDate, error);
          return null;
        }
      })
      .filter((date) => date !== null);

    const nextRenewalDate =
      validDates.length > 0
        ? validDates.sort((a, b) => a.getTime() - b.getTime())[0]
        : new Date();

    return {
      amount: isNaN(totalAmount) ? 0 : totalAmount,
      nextRenewalDate,
    };
  }, [subscriptions]);

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
                  $
                  {typeof balanceData.amount === "number"
                    ? balanceData.amount.toFixed(2)
                    : "0.00"}
                </Text>
                <Text className="home-balance-date">
                  {balanceData.nextRenewalDate.toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading
                title="Upcoming"
                onPress={() => setUpcomingExpanded(!upcomingExpanded)}
              />

              {!upcomingExpanded ? (
                <FlatList
                  data={upcomingSubscriptions}
                  renderItem={({ item }) => (
                    <UpcomingSubscriptionCard {...item} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={
                    <Text className="home-empty-state">
                      No upcoming subscriptions renewals yet.
                    </Text>
                  }
                />
              ) : (
                <View
                  className="rounded-xl p-4 shadow-sm"
                  style={{ backgroundColor: "white" }}
                >
                  <Text
                    className="mb-3 text-sm font-bold"
                    style={{ color: "#081226" }}
                  >
                    UPCOMING THIS WEEK
                  </Text>
                  {upcomingSubscriptions.length === 0 ? (
                    <Text className="text-sm" style={{ color: "#435875" }}>
                      No upcoming subscriptions renewals yet.
                    </Text>
                  ) : (
                    upcomingSubscriptions.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row items-center justify-between border-b border-gray-200 py-2"
                      >
                        <Text
                          className="flex-1 text-xs font-bold"
                          style={{ color: "#081226" }}
                        >
                          {item.daysLeft === 0 ? "Today" : `${item.daysLeft}d`}
                        </Text>
                        <Text
                          className="flex-1 text-xs font-semibold"
                          style={{ color: "#081226" }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className="flex-1 text-xs"
                          style={{ color: "#435875" }}
                        >
                          {item.currency}{" "}
                          {typeof item.price === "number"
                            ? item.price.toFixed(2)
                            : item.price}
                        </Text>
                        <Text
                          className="flex-1 text-xs font-semibold"
                          style={{ color: "#435875" }}
                        >
                          {item.daysLeft === 0 ? "Due Today" : "Pending"}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
            <ListHeading
              title="All Subscription"
              onPress={() => router.push("/(tabs)/subscriptions")}
            />
          </>
        )}
        data={subscriptions}
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
            plan="Custom"
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
