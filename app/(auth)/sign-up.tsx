import { validateEmail } from "@/lib/utils";
import { useClerk, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignUp() {
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    posthog?.screen(needsVerification ? "Verify Email" : "Sign Up");
  }, [posthog, needsVerification]);

  const validateForm = () => {
    if (!emailAddress.trim()) {
      return "Email address is required";
    }
    if (!validateEmail(emailAddress)) {
      return "Please enter a valid email address";
    }
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.trim().length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  };

  const handleSignUp = async () => {
    if (!signUp) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      posthog?.capture("sign_up_validation_failed", {
        error: validationError,
      });
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      posthog?.capture("sign_up_attempted");

      // Create the user account
      const result = await signUp.password({
        emailAddress,
        password,
      });

      if ((result as any)?.error) {
        throw { errors: (result as any).error };
      }

      // Account created successfully, send verification email
      const emailResult = await (signUp as any).verifications.sendEmailCode();

      if ((emailResult as any)?.error) {
        posthog?.capture("verification_email_failed");
        setError("Failed to send verification code. Please try again.");
      } else {
        posthog?.capture("verification_email_sent");
        setNeedsVerification(true);
      }
    } catch (err: any) {
      const firstError = err.errors && err.errors[0];
      if (firstError && firstError.code === "form_identifier_exists") {
        posthog?.capture("sign_up_email_exists");
        setError(
          "This email is already registered. You can sign in with your existing account.",
        );
      } else {
        posthog?.capture("sign_up_failed", {
          error: firstError?.longMessage || firstError?.message || err.message,
        });
        setError(
          firstError?.longMessage ||
            firstError?.message ||
            err.message ||
            "An error occurred during sign up.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!signUp) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      posthog?.capture("verification_code_attempted");

      const result = await (signUp as any).verifications.verifyEmailCode({
        code: verificationCode,
      });

      if ((result as any)?.error) {
        throw { errors: (result as any).error };
      }

      // Verification successful - manually activate the session
      const status = (result as any)?.status || signUp.status;
      const sessionId =
        (result as any)?.createdSessionId || signUp.createdSessionId;

      if (status === "complete" && sessionId) {
        posthog?.capture("verification_success");
        await setActive({ session: sessionId });
        posthog?.capture("user_signed_in", {
          signed_in: true,
        });
        router.replace("/(tabs)");
      } else {
        posthog?.capture("verification_failed");
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      posthog?.capture("verification_error", {
        error:
          err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message,
      });
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "An error occurred during verification.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) {
      return;
    }
    setError(null);

    try {
      const result = await (signUp as any).verifications.sendEmailCode();
      console.log("Resend result:", result);

      if ((result as any)?.error) {
        console.error("Failed to resend code:", result.error);
        setError(result.error.message || "Failed to resend code.");
      } else {
        console.log("Verification code resent to:", emailAddress);
      }
    } catch (err: any) {
      console.error(
        "Resend error:",
        err.errors ? JSON.stringify(err.errors, null, 2) : err.message,
      );
      setError(
        err.errors?.[0]?.longMessage ||
          err.errors?.[0]?.message ||
          err.message ||
          "Failed to resend code.",
      );
    }
  };

  const isFormValid = validateForm() === null;
  const isVerificationValid = verificationCode.length === 6;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>R</Text>
              </View>
              <Text style={styles.brandName}>Recurrly</Text>
            </View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Start managing your subscriptions and tracking your expenses
            </Text>
          </View>

          {/* Sign Up Form */}
          <View style={styles.formCard}>
            <View style={styles.formContent}>
              {!needsVerification ? (
                <>
                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        error ? styles.textInputError : styles.textInputNormal,
                      ]}
                      value={emailAddress}
                      onChangeText={setEmailAddress}
                      placeholder="Enter your email"
                      placeholderTextColor="#666666"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        error ? styles.textInputError : styles.textInputNormal,
                      ]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#666666"
                      secureTextEntry
                    />
                  </View>

                  {/* Error Message */}
                  {error && <Text style={styles.errorText}>{error}</Text>}

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      isFormValid && !isLoading
                        ? styles.buttonActive
                        : styles.buttonInactive,
                    ]}
                    onPress={handleSignUp}
                    disabled={!isFormValid || isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Creating account..." : "Create account"}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Verification Instructions */}
                  <View style={styles.verificationInstructions}>
                    <Text style={styles.subtitle}>
                      We've sent a verification code to
                    </Text>
                    <Text style={styles.verificationEmail}>{emailAddress}</Text>
                    <Text style={styles.verificationSubtitle}>
                      Enter the 6-digit code below
                    </Text>
                  </View>

                  {/* Verification Code Field */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification code</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        error ? styles.textInputError : styles.textInputNormal,
                        { textAlign: "center" },
                      ]}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="000000"
                      placeholderTextColor="#666666"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>

                  {/* Error Message */}
                  {error && <Text style={styles.errorText}>{error}</Text>}

                  {/* Verify Button */}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      isVerificationValid && !isLoading
                        ? styles.buttonActive
                        : styles.buttonInactive,
                    ]}
                    onPress={handleVerification}
                    disabled={!isVerificationValid || isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Verifying..." : "Verify"}
                    </Text>
                  </TouchableOpacity>

                  {/* Resend Button */}
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendCode}
                  >
                    <Text style={styles.resendButtonText}>Resend code</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Sign In Link */}
            <View style={styles.signInLink}>
              <Text style={styles.signInText}>Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text style={styles.signInLinkText}>Sign in</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff9e3",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 32,
  },
  brandSection: {
    marginTop: 8,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#ea7a53",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff9e3",
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#081126",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#081126",
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 320,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#666666",
  },
  formCard: {
    marginTop: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#081126",
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#fff9e3",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#081126",
  },
  textInputError: {
    borderColor: "#ff4444",
  },
  textInputNormal: {
    borderColor: "#e5e5e5",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ff4444",
  },
  button: {
    marginTop: 4,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
  },
  buttonActive: {
    backgroundColor: "#ea7a53",
  },
  buttonInactive: {
    backgroundColor: "rgba(234, 122, 83, 0.27)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#081126",
  },
  verificationInstructions: {
    alignItems: "center",
    paddingVertical: 16,
  },
  verificationEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ea7a53",
  },
  verificationSubtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  resendButton: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(234, 122, 83, 0.3)",
    backgroundColor: "rgba(234, 122, 83, 0.1)",
    paddingVertical: 12,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ea7a53",
  },
  signInLink: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  signInText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  signInLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ea7a53",
  },
});
