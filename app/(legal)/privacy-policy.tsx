import { styled } from "nativewind";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const PrivacyPolicy = () => {
  return (
    <SafeAreaView style={{ backgroundColor: "#FFF9E3" }} className="flex-1">
      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold" style={{ color: "#081226" }}>
            Privacy Policy
          </Text>
          <Text className="text-sm mt-2" style={{ color: "#435875" }}>
            Last updated: April 24, 2026
          </Text>
        </View>

        {/* Content */}
        <View className="space-y-6">
          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              1. Information We Collect
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Recurrly collects the following information to provide our
              subscription tracking service:
            </Text>
            <Text
              className="text-sm mt-2 leading-6"
              style={{ color: "#435875" }}
            >
              • Account information: Your name, email address, and profile
              picture (provided through Clerk authentication)
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Subscription data: Names of subscriptions, prices, renewal
              dates, categories, and payment methods
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Usage data: App usage patterns and analytics to improve our
              service
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              2. How We Use Your Information
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We use your information to:
            </Text>
            <Text
              className="text-sm mt-2 leading-6"
              style={{ color: "#435875" }}
            >
              • Provide and maintain the subscription tracking service
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Send you notifications about upcoming subscription renewals
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Analyze usage patterns to improve our features and user
              experience
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Communicate with you about service updates and support
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              3. Data Storage and Security
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Your data is stored securely using industry-standard encryption
              and security measures. We use:
            </Text>
            <Text
              className="text-sm mt-2 leading-6"
              style={{ color: "#435875" }}
            >
              • Clerk for secure authentication and user management
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • PostgreSQL database for secure data storage
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Secure HTTPS connections for all data transmission
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              4. Third-Party Services
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We use the following third-party services:
            </Text>
            <Text
              className="text-sm mt-2 leading-6"
              style={{ color: "#435875" }}
            >
              • Clerk: For user authentication and account management
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • PostHog: For analytics and product improvement
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              These services have their own privacy policies which we encourage
              you to review.
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              5. Your Rights
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              You have the right to:
            </Text>
            <Text
              className="text-sm mt-2 leading-6"
              style={{ color: "#435875" }}
            >
              • Access your personal data
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Correct inaccurate data
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Delete your account and all associated data
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Opt out of analytics tracking
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              6. Data Retention
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We retain your data for as long as your account is active. If you
              delete your account, your data will be permanently deleted within
              30 days.
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              7. Children's Privacy
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Recurrly is not intended for children under 13. We do not
              knowingly collect personal information from children under 13.
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              8. Changes to This Policy
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </Text>
          </View>

          <View>
            <Text
              className="text-lg font-bold mb-2"
              style={{ color: "#081226" }}
            >
              9. Contact Us
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              If you have any questions about this privacy policy, please
              contact us at:
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Email: support@recurrly.app
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
