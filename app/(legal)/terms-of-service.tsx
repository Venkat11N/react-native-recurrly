import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

const TermsOfService = () => {
  return (
    <SafeAreaView style={{ backgroundColor: "#FFF9E3" }} className="flex-1">
      <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold" style={{ color: "#081226" }}>
            Terms of Service
          </Text>
          <Text className="text-sm mt-2" style={{ color: "#435875" }}>
            Last updated: April 24, 2026
          </Text>
        </View>

        {/* Content */}
        <View className="space-y-6">
          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              1. Acceptance of Terms
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              By downloading, accessing, or using the Recurrly application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              2. Description of Service
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Recurrly is a subscription tracking application that helps users manage their recurring expenses, track renewal dates, and monitor spending patterns. The service is provided on an "as is" basis.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              3. User Responsibilities
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              As a user of Recurrly, you agree to:
            </Text>
            <Text className="text-sm mt-2 leading-6" style={{ color: "#435875" }}>
              • Provide accurate and complete information when creating your account
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Maintain the security of your account credentials
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Use the service only for its intended purpose
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Not attempt to reverse engineer, hack, or exploit the application
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              • Not use the service for any illegal or unauthorized purpose
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              4. Account Security
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Recurrly is not liable for any loss or damage arising from your failure to protect your account information.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              5. Intellectual Property
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              All content, features, and functionality of the Recurrly application are owned by Recurrly and are protected by international copyright, trademark, and other intellectual property laws.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              6. User Data
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              You retain ownership of all data you input into the Recurrly application. However, by using the service, you grant Recurrly a license to store, process, and use your data to provide the service and improve our offerings.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              7. Disclaimer of Warranties
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              Recurrly is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              8. Limitation of Liability
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              To the fullest extent permitted by law, Recurrly shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              9. Termination
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We reserve the right to terminate or suspend your account at any time, with or without cause, with or without notice. Upon termination, your right to use the service will immediately cease.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              10. Governing Law
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Recurrly is based, without regard to its conflict of law provisions.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              11. Changes to Terms
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              We reserve the right to modify these terms at any time. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold mb-2" style={{ color: "#081226" }}>
              12. Contact Information
            </Text>
            <Text className="text-sm leading-6" style={{ color: "#435875" }}>
              If you have any questions about these Terms of Service, please contact us at:
            </Text>
            <Text className="text-sm mt-2 leading-6" style={{ color: "#435875" }}>
              Email: support@recurrly.app
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;
