import { validateEmail } from "@/lib/utils";
import { useClerk, useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignIn() {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    posthog?.screen("Sign In");
  }, [posthog]);

  const validateForm = () => {
    if (!emailAddress.trim()) {
      return "Email address is required";
    }
    if (!validateEmail(emailAddress)) {
      return "Please enter a valid email address";
    }
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return null;
  };

  const handleSignIn = async () => {
    if (!signIn) {
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      posthog?.capture("sign_in_validation_failed", {
        error: validationError,
      });
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      posthog?.capture("sign_in_attempted", {
        email: emailAddress,
      });

      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if ((result as any)?.error) {
        throw { errors: (result as any).error };
      }

      // Workaround: @clerk/expo may return the native token cache response on success.
      // Fallback to reading the status directly from the mutated signIn object.
      const status = result?.status || signIn.status;
      const sessionId = result?.createdSessionId || signIn.createdSessionId;

      if (status === "complete") {
        posthog?.capture("sign_in_success");
        posthog?.capture("user_signed_in", {
          email: emailAddress,
        });
        await setActive({ session: sessionId });
        router.replace("/(tabs)");
      } else {
        setError("Additional verification required.");
        posthog?.capture("sign_in_requires_verification");
      }
    } catch (err: any) {
      posthog?.capture("sign_in_failed", {
        error: err.errors?.[0]?.longMessage || err.message,
      });
      setError(
        err.errors?.[0]?.longMessage ||
          err.message ||
          "An error occurred during sign in.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = validateForm() === null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Sign In Form */}
            <View style={styles.formCard}>
              <View style={styles.formContent}>
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

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[
                    styles.button,
                    isFormValid && !isLoading
                      ? styles.buttonActive
                      : styles.buttonInactive,
                  ]}
                  onPress={handleSignIn}
                  disabled={!isFormValid || isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpLink}>
                <Text style={styles.signUpText}>Don't have an account?</Text>
                <Link href="/(auth)/sign-up">
                  <Text style={styles.signUpLinkText}>Sign up</Text>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  signUpLink: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  signUpLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ea7a53",
  },
});
