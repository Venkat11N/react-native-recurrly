import { icons } from "@/constants/icons";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const { subscriptions } = useSubscriptions();
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Calculate real data from subscriptions
  const insightsData = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active",
    );

    // Calculate weekly upcoming renewals
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingRenewals = activeSubscriptions
      .map((sub) => ({
        ...sub,
        renewalDate: new Date(sub.renewalDate),
      }))
      .filter(
        (sub) => sub.renewalDate >= today && sub.renewalDate <= weekFromNow,
      )
      .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

    // Calculate chart data (last 7 days of spending)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const daySubscriptions = activeSubscriptions.filter((sub) => {
        const subDate = new Date(sub.renewalDate);
        return (
          subDate.getDate() === date.getDate() &&
          subDate.getMonth() === date.getMonth() &&
          subDate.getFullYear() === date.getFullYear()
        );
      });
      const totalAmount = daySubscriptions.reduce(
        (sum, sub) => sum + sub.price,
        0,
      );
      last7Days.push({
        day: dayName,
        value: totalAmount,
        highlighted: i === 0, // Highlight today
        badge: i === 0 ? `$${totalAmount.toFixed(0)}` : undefined,
      });
    }

    // Calculate monthly total
    const monthlyTotal = activeSubscriptions
      .filter((sub) => sub.frequency === "Monthly")
      .reduce((sum, sub) => sum + sub.price, 0);
    const yearlyTotal = activeSubscriptions
      .filter((sub) => sub.frequency === "Yearly")
      .reduce((sum, sub) => sum + sub.price, 0);
    const monthlyEquivalent = monthlyTotal + yearlyTotal / 12;

    // Find max value for chart scaling
    const maxValue = Math.max(...last7Days.map((d) => d.value), 50);

    return {
      chartData: last7Days,
      yAxisLabels:
        maxValue > 0
          ? [maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, 0]
          : [50, 40, 30, 20, 0],
      upcomingRenewals,
      monthlyTotal: monthlyEquivalent,
      allSubscriptions: activeSubscriptions,
    };
  }, [subscriptions]);

  return (
    <SafeAreaView style={{ backgroundColor: "#FFF9E3" }} className="flex-1">
      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-center">
          <Text className="text-xl font-bold" style={{ color: "#081226" }}>
            Monthly Insights
          </Text>
        </View>

        {/* Section 1 - Upcoming */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: "#081226" }}>
              Upcoming
            </Text>
            <Pressable
              onPress={() => setUpcomingExpanded(!upcomingExpanded)}
              className="rounded-full px-4 py-1"
              style={{
                borderColor: "#C6BFA2",
                borderWidth: 1,
                borderRadius: 17.5,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: "#435875" }}
              >
                {upcomingExpanded ? "Show less" : "View all"}
              </Text>
            </Pressable>
          </View>

          {!upcomingExpanded ? (
            /* Bar Chart */
            <View
              className="rounded-2xl p-4 shadow-sm"
              style={{
                backgroundColor: "#F6ECC9",
                elevation: 2,
                height: 264,
                width: "100%",
              }}
            >
              <View className="relative flex-row h-full">
                {/* Y-Axis */}
                <View
                  className="mr-2 flex-col justify-between pr-2 h-full"
                  style={{ width: 40 }}
                >
                  {insightsData.yAxisLabels.map(
                    (label: number, index: number) => (
                      <View
                        key={index}
                        className="relative flex-row items-center"
                        style={{
                          height: `${100 / insightsData.yAxisLabels.length}%`,
                        }}
                      >
                        <Text
                          className="mr-2 text-xs font-semibold"
                          style={{ color: "#435875", fontSize: 11 }}
                        >
                          ${label.toFixed(0)}
                        </Text>
                        <View
                          className="flex-1 border-b"
                          style={{
                            opacity: 0.2,
                            borderColor: "#8D8561",
                            borderWidth: 1.5,
                            borderStyle: "dashed",
                          }}
                        />
                      </View>
                    ),
                  )}
                </View>

                {/* Bars */}
                <View className="flex-1 flex-col justify-between h-full px-2">
                  <View className="flex-row justify-between items-end h-full pb-2">
                    {insightsData.chartData.map((item: any, index: number) => {
                      const maxValue = Math.max(
                        ...insightsData.chartData.map((d: any) => d.value),
                        50,
                      );
                      return (
                        <View
                          key={index}
                          className="items-center"
                          style={{ flex: 1 }}
                        >
                          {item.highlighted && (
                            <View
                              className="mb-1 rounded px-2 py-0.5"
                              style={{ backgroundColor: "white" }}
                            >
                              <Text
                                className="text-xs font-bold"
                                style={{ color: "#EA7A53", fontSize: 11 }}
                              >
                                {item.badge}
                              </Text>
                            </View>
                          )}
                          <View
                            className="rounded-full mx-auto"
                            style={{
                              width: 12,
                              height: `${(item.value / maxValue) * 100}%`,
                              backgroundColor: item.highlighted
                                ? "#EA7A53"
                                : "#081226",
                              borderRadius: 6,
                            }}
                          />
                          <Text
                            className="mt-1 text-xs font-semibold"
                            style={{ color: "#435875", fontSize: 11 }}
                          >
                            {item.day}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Expanded Table */
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
              {insightsData.upcomingRenewals.length === 0 ? (
                <Text className="text-sm" style={{ color: "#435875" }}>
                  No upcoming renewals this week.
                </Text>
              ) : (
                insightsData.upcomingRenewals.map(
                  (item: any, index: number) => {
                    const daysLeft = Math.ceil(
                      (item.renewalDate.getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const dayName = item.renewalDate
                      .toLocaleDateString("en-US", { weekday: "short" })
                      .toUpperCase();
                    const isToday = daysLeft === 0;
                    return (
                      <View
                        key={index}
                        className="flex-row items-center justify-between border-b border-gray-200 py-2"
                        style={{
                          backgroundColor: isToday ? "#EA7A53" : "transparent",
                          borderRadius: isToday ? 8 : 0,
                        }}
                      >
                        <Text
                          className="flex-1 text-xs font-bold"
                          style={{
                            color: isToday ? "white" : "#081226",
                          }}
                        >
                          {dayName}
                          {isToday && " ●"}
                        </Text>
                        <Text
                          className="flex-1 text-xs font-semibold"
                          style={{
                            color: isToday ? "white" : "#081226",
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className="flex-1 text-xs"
                          style={{
                            color: isToday ? "white" : "#435875",
                          }}
                        >
                          ${item.price.toFixed(2)}
                        </Text>
                        <Text
                          className="flex-1 text-xs font-semibold"
                          style={{
                            color: isToday ? "white" : "#435875",
                          }}
                        >
                          {isToday ? "Due Today" : "Pending"}
                        </Text>
                      </View>
                    );
                  },
                )
              )}
              <View className="mt-3 flex-row items-center justify-between pt-2 border-t border-gray-200">
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  Total this week:
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  $
                  {insightsData.upcomingRenewals
                    .reduce((sum: number, item: any) => sum + item.price, 0)
                    .toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Section 2 - Expenses Summary Card */}
        <View
          className="mb-6 rounded-2xl p-5 shadow-sm"
          style={{
            backgroundColor: "white",
            elevation: 2,
            borderColor: "#C6BFA2",
            borderWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold" style={{ color: "#081226" }}>
                Expenses
              </Text>
              <Text className="text-sm" style={{ color: "#435875" }}>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xl font-bold" style={{ color: "#081226" }}>
                -${insightsData.monthlyTotal.toFixed(2)}
              </Text>
              <Text className="text-sm font-semibold text-green-600">
                Monthly
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3 - History */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: "#081226" }}>
              History
            </Text>
            <Pressable
              onPress={() => setHistoryExpanded(!historyExpanded)}
              className="rounded-full px-4 py-1"
              style={{
                borderColor: "#C6BFA2",
                borderWidth: 1,
                borderRadius: 17.5,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: "#435875" }}
              >
                {historyExpanded ? "Show less" : "View all"}
              </Text>
            </Pressable>
          </View>

          {!historyExpanded ? (
            /* History Cards */
            <>
              {insightsData.allSubscriptions
                .slice(0, 2)
                .map((sub: any, index: number) => {
                  const colors = ["#F7D44C", "#8BCBB8", "#E8DEF8", "#F5A3C7"];
                  const bgColor = colors[index % colors.length];
                  const icon = sub.icon
                    ? (icons as any)[sub.icon] || icons.wallet
                    : icons.wallet;
                  return (
                    <View
                      key={sub.id}
                      className="mb-3 p-4 shadow-sm"
                      style={{
                        backgroundColor: bgColor,
                        elevation: 2,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 16,
                        borderBottomRightRadius: 16,
                        borderBottomLeftRadius: 0,
                      }}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="mr-3 size-14 items-center justify-center"
                          style={{
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            borderRadius: 10,
                          }}
                        >
                          <Image
                            source={icon}
                            className="size-8"
                            resizeMode="contain"
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-lg font-bold"
                            style={{ color: "#081226" }}
                          >
                            {sub.name}
                          </Text>
                          <Text
                            className="text-sm"
                            style={{ color: "#435875" }}
                          >
                            {new Date(sub.renewalDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            className="text-lg font-bold"
                            style={{ color: "#081226" }}
                          >
                            ${sub.price.toFixed(2)}
                          </Text>
                          <Text
                            className="text-xs"
                            style={{ color: "#435875" }}
                          >
                            {sub.frequency.toLowerCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              {insightsData.allSubscriptions.length === 0 && (
                <Text className="text-sm" style={{ color: "#435875" }}>
                  No subscriptions yet.
                </Text>
              )}
            </>
          ) : (
            /* Expanded Table */
            <View
              className="rounded-xl p-4 shadow-sm"
              style={{ backgroundColor: "white" }}
            >
              <Text
                className="mb-3 text-sm font-bold"
                style={{ color: "#081226" }}
              >
                ALL SUBSCRIPTIONS
              </Text>
              {insightsData.allSubscriptions.length === 0 ? (
                <Text className="text-sm" style={{ color: "#435875" }}>
                  No subscriptions yet.
                </Text>
              ) : (
                insightsData.allSubscriptions.map((sub: any, index: number) => {
                  const colors = ["#F7D44C", "#8BCBB8", "#E8DEF8", "#F5A3C7"];
                  const bgColor = colors[index % colors.length];
                  const icon = sub.icon
                    ? (icons as any)[sub.icon] || icons.wallet
                    : icons.wallet;
                  return (
                    <View
                      key={sub.id}
                      className="flex-row items-center justify-between border-b border-gray-200 py-2"
                    >
                      <View
                        className="mr-2 size-8 items-center justify-center rounded"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Image
                          source={icon}
                          className="size-5"
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        className="flex-1 text-xs font-semibold"
                        style={{ color: "#081226" }}
                      >
                        {sub.name}
                      </Text>
                      <Text
                        className="flex-1 text-xs"
                        style={{ color: "#435875" }}
                      >
                        ${sub.price.toFixed(2)}/
                        {sub.frequency.toLowerCase().slice(0, 1)}
                      </Text>
                      <Text
                        className="flex-1 text-xs"
                        style={{ color: "#435875" }}
                      >
                        {new Date(sub.renewalDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  );
                })
              )}
              <View className="mt-3 flex-row items-center justify-between pt-3 pb-2 border-t border-gray-200">
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  Monthly total:
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  ${insightsData.monthlyTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
