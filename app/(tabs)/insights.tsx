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
    console.log("Insights - Recalculating with subscriptions:", subscriptions);
    const activeSubscriptions = subscriptions.filter(
      (sub) =>
        String(sub.status || "active")
          .trim()
          .toLowerCase() === "active",
    );

    // Calculate weekly upcoming renewals
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    weekFromNow.setHours(23, 59, 59, 999);

    const upcomingRenewals = activeSubscriptions
      .map((sub) => {
        const subDate = new Date(sub.renewalDate);
        let nextRenewal = new Date(subDate);

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
              subDate.getDate(),
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
              subDate.getMonth(),
              subDate.getDate(),
            );
            if (
              nextRenewal < today &&
              nextRenewal.toDateString() !== today.toDateString()
            ) {
              nextRenewal.setFullYear(nextRenewal.getFullYear() + 1);
            }
          }
        }

        return {
          ...sub,
          renewalDate: nextRenewal,
        };
      })
      .filter(
        (sub) => sub.renewalDate >= today && sub.renewalDate <= weekFromNow,
      )
      .sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime());

    // Calculate chart data (next 7 days of upcoming renewals)
    const monthlySubs = activeSubscriptions.filter(
      (sub) =>
        String(sub.status || "active")
          .trim()
          .toLowerCase() === "active" &&
        String(sub.frequency || "Monthly")
          .trim()
          .toLowerCase() === "monthly",
    );
    const yearlySubs = activeSubscriptions.filter(
      (sub) =>
        String(sub.status || "active")
          .trim()
          .toLowerCase() === "active" &&
        String(sub.frequency || "Yearly")
          .trim()
          .toLowerCase() === "yearly",
    );

    console.log("Insights - Monthly subs:", monthlySubs);
    console.log("Insights - Yearly subs:", yearlySubs);

    const monthlyTotal = monthlySubs.reduce(
      (sum, sub) => sum + (Number(sub.price) || 0),
      0,
    );
    const yearlyTotal = yearlySubs.reduce(
      (sum, sub) => sum + (Number(sub.price) || 0),
      0,
    );
    const totalAmount = monthlyTotal + yearlyTotal;

    console.log(
      "Insights - Monthly total:",
      monthlyTotal,
      "Yearly total:",
      yearlyTotal,
      "Total amount:",
      totalAmount,
    );

    // Show fixed week sequence (Monday through Sunday)
    const weekDays = [];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days until Monday
    const monday = new Date(
      today.getTime() - mondayOffset * 24 * 60 * 60 * 1000,
    );

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const isToday = date.toDateString() === today.toDateString();

      // Check if any subscription renews on this specific calendar date
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySubscriptions = activeSubscriptions.filter((sub) => {
        const subDate = new Date(sub.renewalDate);
        const startDate = sub.startDate ? new Date(sub.startDate) : subDate;
        startDate.setHours(0, 0, 0, 0);

        if (
          date < startDate &&
          date.toDateString() !== startDate.toDateString()
        ) {
          return false;
        }

        if (subDate.toDateString() === date.toDateString()) return true;

        if (
          String(sub.frequency || "Monthly")
            .trim()
            .toLowerCase() === "monthly"
        ) {
          return subDate.getDate() === date.getDate();
        }
        if (
          String(sub.frequency || "Yearly")
            .trim()
            .toLowerCase() === "yearly"
        ) {
          return (
            subDate.getDate() === date.getDate() &&
            subDate.getMonth() === date.getMonth()
          );
        }
        return subDate >= dayStart && subDate <= dayEnd;
      });
      const renewalAmount = daySubscriptions.reduce(
        (sum, sub) => sum + (Number(sub.price) || 0),
        0,
      );

      const displayValue = renewalAmount;

      weekDays.push({
        day: dayName,
        value: displayValue,
        highlighted: isToday,
        badge:
          displayValue > 0
            ? `$${
                displayValue >= 1000
                  ? (displayValue / 1000).toFixed(
                      displayValue % 1000 === 0 ? 0 : 1,
                    ) + "k"
                  : displayValue.toFixed(0)
              }`
            : null,
        showBar: true,
      });
    }

    // Find max value for chart scaling with clean, readable intervals
    const rawMax = Math.max(...weekDays.map((d) => d.value), 0);

    // Add 10% visual padding so the highest bar never hits the absolute ceiling
    const paddedMax = rawMax * 1.1;

    let maxValue = 12; // Default minimum (intervals of 3: $12, $9, $6, $3, $0)
    if (paddedMax > 0) {
      if (paddedMax <= 12) maxValue = 12;
      else if (paddedMax <= 20)
        maxValue = 20; // intervals of 5
      else if (paddedMax <= 40)
        maxValue = 40; // intervals of 10
      else if (paddedMax <= 60)
        maxValue = 60; // intervals of 15
      else if (paddedMax <= 100)
        maxValue = 100; // intervals of 25
      else if (paddedMax <= 200)
        maxValue = 200; // intervals of 50
      else if (paddedMax <= 400)
        maxValue = 400; // intervals of 100
      else if (paddedMax <= 600)
        maxValue = 600; // intervals of 150
      else if (paddedMax <= 1000)
        maxValue = 1000; // intervals of 250
      else maxValue = Math.ceil(paddedMax / 400) * 400;
    }

    console.log("Graph - Week days data:", weekDays);
    console.log("Graph - Max value:", maxValue);

    return {
      chartData: weekDays,
      yAxisLabels: [
        maxValue,
        maxValue * 0.75,
        maxValue * 0.5,
        maxValue * 0.25,
        0,
      ],
      upcomingRenewals,
      maxValue,
      monthlyTotal: isNaN(totalAmount) ? 0 : totalAmount,
      monthlySubscriptionsTotal: monthlyTotal,
      yearlySubscriptionsTotal: yearlyTotal,
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

        {/* Total Expenses Breakdown */}
        <View
          className="rounded-xl p-4 mb-6"
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text className="text-sm font-bold mb-3" style={{ color: "#081226" }}>
            TOTAL EXPENSES
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm" style={{ color: "#435875" }}>
              Subscriptions
            </Text>
            <Text
              className="text-sm font-semibold"
              style={{ color: "#081226" }}
            >
              ${insightsData.monthlyTotal?.toFixed(2) || "0.00"}
            </Text>
          </View>
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
              <View className="relative flex-row h-full pt-8 pb-2">
                {/* Y-Axis */}
                <View
                  className="mr-2 flex-col justify-between mb-7"
                  style={{ width: 45 }}
                >
                  {insightsData.yAxisLabels.map(
                    (label: number, index: number) => (
                      <View
                        key={index}
                        className="items-end justify-center"
                        style={{ height: 1, zIndex: 10 }}
                      >
                        <Text
                          className="text-right text-xs font-semibold"
                          style={{
                            color: "#435875",
                            fontSize: 11,
                            top: -7,
                            position: "absolute",
                          }}
                        >
                          $
                          {typeof label === "number"
                            ? label >= 1000
                              ? (label / 1000).toFixed(
                                  label % 1000 === 0 ? 0 : 1,
                                ) + "k"
                              : label.toFixed(0)
                            : "0"}
                        </Text>
                      </View>
                    ),
                  )}
                </View>

                {/* Chart Content */}
                <View className="flex-1 flex-col h-full px-1">
                  {/* Grid Lines and Bars */}
                  <View className="flex-1 relative">
                    {/* Grid lines */}
                    <View className="absolute inset-0 flex-col justify-between pointer-events-none">
                      {insightsData.yAxisLabels.map(
                        (_: number, index: number) => (
                          <View
                            key={index}
                            className="w-full border-b"
                            style={{
                              borderColor: "#8D8561",
                              borderWidth: 1,
                              borderStyle: "dashed",
                              opacity: 0.2,
                            }}
                          />
                        ),
                      )}
                    </View>

                    {/* Bars */}
                    <View className="absolute inset-0 flex-row justify-between items-end">
                      {insightsData.chartData.map(
                        (item: any, index: number) => (
                          <View
                            key={index}
                            className="items-center justify-end h-full flex-1 relative"
                          >
                            {item.badge && (
                              <View
                                className="absolute rounded px-1.5 py-0.5 z-10"
                                style={{
                                  backgroundColor: "white",
                                  bottom: `${(item.value / insightsData.maxValue) * 100}%`,
                                  marginBottom: 4,
                                }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: "#EA7A53", fontSize: 10 }}
                                >
                                  {item.badge}
                                </Text>
                              </View>
                            )}
                            {item.showBar && (
                              <View
                                className="rounded-full mx-auto w-full"
                                style={{
                                  maxWidth: 12,
                                  height: `${(item.value / insightsData.maxValue) * 100}%`,
                                  minHeight: 4,
                                  backgroundColor: item.highlighted
                                    ? "#EA7A53"
                                    : "#081226",
                                  borderRadius: 6,
                                }}
                              />
                            )}
                          </View>
                        ),
                      )}
                    </View>
                  </View>

                  {/* X-Axis Labels */}
                  <View className="flex-row justify-between h-5 mt-2">
                    {insightsData.chartData.map((item: any, index: number) => (
                      <View key={index} className="flex-1 items-center">
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: "#435875", fontSize: 11 }}
                        >
                          {item.day}
                        </Text>
                      </View>
                    ))}
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
                ALL SUBSCRIPTIONS
              </Text>
              {insightsData.allSubscriptions.length === 0 ? (
                <Text className="text-sm" style={{ color: "#435875" }}>
                  No subscriptions yet.
                </Text>
              ) : (
                insightsData.allSubscriptions.map(
                  (item: any, index: number) => {
                    const daysLeft = Math.ceil(
                      (new Date(item.renewalDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const renewalDate = new Date(item.renewalDate);
                    const dayName = renewalDate
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
                          $
                          {typeof item.price === "number"
                            ? item.price.toFixed(2)
                            : parseFloat(
                                item.price as unknown as string,
                              ).toFixed(2)}
                        </Text>
                        <Text
                          className="flex-1 text-xs font-semibold"
                          style={{
                            color: isToday ? "white" : "#435875",
                          }}
                        >
                          {isToday
                            ? "Due Today"
                            : daysLeft > 0
                              ? `${daysLeft}d`
                              : "Overdue"}
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
                  Total:
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  $
                  {typeof insightsData.monthlyTotal === "number"
                    ? insightsData.monthlyTotal.toFixed(2)
                    : "0.00"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Section 2 - History */}
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
                            $
                            {typeof sub.price === "number"
                              ? sub.price.toFixed(2)
                              : parseFloat(
                                  sub.price as unknown as string,
                                ).toFixed(2)}
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
                        $
                        {typeof sub.price === "number"
                          ? sub.price.toFixed(2)
                          : parseFloat(sub.price as unknown as string).toFixed(
                              2,
                            )}
                        /{sub.frequency.toLowerCase().slice(0, 1)}
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
                  Total:
                </Text>
                <Text
                  className="text-sm font-bold"
                  style={{ color: "#081226" }}
                >
                  $
                  {typeof insightsData.monthlyTotal === "number"
                    ? insightsData.monthlyTotal.toFixed(2)
                    : "0.00"}
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
