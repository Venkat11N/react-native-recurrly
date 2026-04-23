import { getSubscriptionIcon } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscriptionCreated: (
    subscription: Omit<any, "id" | "userId" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
}

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Apple Pay",
  "Google Pay",
  "Bank Transfer",
];

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubscriptionCreated,
}: CreateSubscriptionModalProps) {
  const posthog = usePostHog();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceValue = parseFloat(price);
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  const isFormValid =
    name.trim().length > 0 &&
    priceRegex.test(price) &&
    Number.isFinite(priceValue) &&
    priceValue > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    let renewalDate: string;

    if (frequency === "Monthly") {
      renewalDate = dayjs().add(1, "month").toISOString();
    } else {
      renewalDate = dayjs().add(1, "year").toISOString();
    }

    const subscriptionData = {
      name: name.trim(),
      price: priceValue,
      currency: "USD",
      frequency: frequency as "Monthly" | "Yearly",
      category: category || "Other",
      icon: getSubscriptionIcon(name.trim()),
      renewalDate,
      startDate: dayjs().toISOString(),
      paymentMethod: paymentMethod || "Credit Card",
    };

    try {
      await onSubscriptionCreated(subscriptionData);
      onClose();
      setName("");
      setPrice("");
      setFrequency("Monthly");
      setCategory("");
      setPaymentMethod("");
      posthog?.capture("subscription_created", {
        name: subscriptionData.name,
        price: subscriptionData.price,
        frequency: subscriptionData.frequency,
      });
    } catch (error) {
      console.error("Failed to create subscription:", error);
      alert("Failed to create subscription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View
            style={{
              backgroundColor: "#FFF9E3",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              marginTop: "auto",
              maxHeight: "90%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#C6BFA2",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#081226",
                }}
              >
                New Subscription
              </Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                <Text
                  style={{ fontSize: 28, color: "#081226", fontWeight: "300" }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView
              style={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name Field */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#081226",
                    marginBottom: 8,
                  }}
                >
                  Name
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#C6BFA2",
                    color: "#081226",
                  }}
                  value={name}
                  onChangeText={setName}
                  placeholder="Netflix, Spotify, etc."
                  placeholderTextColor="#666666"
                />
              </View>

              {/* Price Field */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#081226",
                    marginBottom: 8,
                  }}
                >
                  Price
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: "#C6BFA2",
                    color: "#081226",
                  }}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency Toggle */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#081226",
                    marginBottom: 8,
                  }}
                >
                  Frequency
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "white",
                    borderRadius: 12,
                    padding: 4,
                    borderWidth: 1,
                    borderColor: "#C6BFA2",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setFrequency("Monthly")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor:
                        frequency === "Monthly" ? "#EA7A53" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: "600",
                        color: frequency === "Monthly" ? "white" : "#081226",
                      }}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFrequency("Yearly")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor:
                        frequency === "Yearly" ? "#EA7A53" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: "600",
                        color: frequency === "Yearly" ? "white" : "#081226",
                      }}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#081226",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: category === cat ? "#EA7A53" : "white",
                        borderWidth: 1,
                        borderColor: category === cat ? "#EA7A53" : "#C6BFA2",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: category === cat ? "white" : "#081226",
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Payment Method Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#081226",
                    marginBottom: 8,
                  }}
                >
                  Payment Method
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                      key={method}
                      onPress={() => setPaymentMethod(method)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor:
                          paymentMethod === method ? "#EA7A53" : "white",
                        borderWidth: 1,
                        borderColor:
                          paymentMethod === method ? "#EA7A53" : "#C6BFA2",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: paymentMethod === method ? "white" : "#081226",
                        }}
                      >
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                style={{
                  backgroundColor:
                    isFormValid && !isSubmitting ? "#EA7A53" : "#CCCCCC",
                  paddingVertical: 16,
                  borderRadius: 12,
                  marginTop: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Create Subscription
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
