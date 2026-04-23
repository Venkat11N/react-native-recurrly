import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id || typeof id !== "string") {
      router.replace("/(tabs)");
    }
  }, [id, router]);

  if (!id || typeof id !== "string") {
    return null;
  }

  return (
    <View>
      <Text>Subscription Details: {id} </Text>
      <Link href="/">Go back</Link>
    </View>
  );
};

export default SubscriptionDetails;
