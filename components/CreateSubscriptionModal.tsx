import { Subscription } from "@/constants/data";
import { getSubscriptionIcon } from "@/lib/utils";
import clsx from "clsx";
import dayjs from "dayjs";
import { styled } from "nativewind";
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
  onSubscriptionCreated: (subscription: Subscription) => void;
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

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#d4e3f5",
  Music: "#e8d4f5",
  Other: "#e0e0e0",
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubscriptionCreated,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("");

  const isFormValid = name.trim().length > 0 && parseFloat(price) > 0;

  const handleSubmit = () => {
    if (!isFormValid) return;

    const priceValue = parseFloat(price);
    const startDate = new Date().toISOString();
    let renewalDate: string;

    if (frequency === "Monthly") {
      renewalDate = dayjs().add(1, "month").toISOString();
    } else {
      renewalDate = dayjs().add(1, "year").toISOString();
    }

    const newSubscription: Subscription = {
      id: `new-${Date.now()}`,
      icon: getSubscriptionIcon(name.trim()),
      name: name.trim(),
      plan: "Custom",
      category: category || "Other",
      paymentMethod: "Card",
      status: "active",
      startDate: dayjs().toISOString(),
      price: priceValue,
      currency: "USD",
      billing: frequency as "Monthly" | "Yearly",
      renewalDate,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
    };

    onSubscriptionCreated(newSubscription);

    // Reset form
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="modal-overlay">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="modal-container">
            {/* Header */}
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <TouchableOpacity onPress={onClose} className="modal-close">
                <Text className="modal-close-text">×</Text>
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView
              className="modal-body"
              keyboardShouldPersistTaps="handled"
            >
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className="auth-input"
                  value={name}
                  onChangeText={setName}
                  placeholder="Netflix, Spotify, etc."
                  placeholderTextColor="#666666"
                />
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className="auth-input"
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Frequency Toggle */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <TouchableOpacity
                    onPress={() => setFrequency("Monthly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Monthly" && "picker-option-active",
                    )}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Monthly" && "picker-option-text-active",
                      )}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFrequency("Yearly")}
                    className={clsx(
                      "picker-option",
                      frequency === "Yearly" && "picker-option-active",
                    )}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === "Yearly" && "picker-option-text-active",
                      )}
                    >
                      Yearly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Selection */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid}
                className={clsx(
                  "auth-button",
                  !isFormValid && "auth-button-disabled",
                )}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
