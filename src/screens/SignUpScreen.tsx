// src/screens/SignUpScreen.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ONBOARDING_KEY } from "../screens/OnboardingScreen";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const BG_IMAGE = require("../../assets/images/hunt_bg_8_friends_overlook.jpg");
const LOGO_ICON = require("../../assets/images/icon_white_1024.png");

// InputField defined OUTSIDE component to prevent remounting on keystroke
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: any;
}

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  keyboardType = "default",
}: InputFieldProps) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={COLORS.midGray}
      secureTextEntry={secure}
      autoCapitalize={
        secure || keyboardType === "email-address" ? "none" : "words"
      }
      autoCorrect={false}
      keyboardType={keyboardType}
    />
  </View>
);

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async () => {
    if (!displayName.trim())
      return Alert.alert("Missing info", "Please enter your name");
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email");
    if (!password.trim())
      return Alert.alert("Missing info", "Please enter a password");
    if (password.length < 6)
      return Alert.alert(
        "Weak password",
        "Password must be at least 6 characters",
      );
    if (password !== confirmPassword)
      return Alert.alert("Mismatch", "Passwords do not match");
    if (!agreedToTerms)
      return Alert.alert(
        "Agreement Required",
        "Please agree to the Terms of Service and Privacy Policy to continue.",
      );

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (hasSeenOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/onboarding");
      }
    } catch (error: any) {
      let message = "Sign up failed. Please try again.";
      if (error.code === "auth/email-already-in-use")
        message = "An account with this email already exists.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      if (error.code === "auth/weak-password")
        message = "Password is too weak. Use at least 6 characters.";
      Alert.alert("Sign Up Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero background */}
      <Image source={BG_IMAGE} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={LOGO_ICON}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Join Scavlandia</Text>
              <Text style={styles.headerSub}>
                Create your free account and start exploring
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <InputField
                label="Your Name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="e.g. Alex Johnson"
              />
              <InputField
                label="Email Address"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
              />
              <InputField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="At least 6 characters"
                secure
              />
              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Type your password again"
                secure
              />

              {/* Password strength */}
              {password.length > 0 && (
                <View style={styles.strengthRow}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          password.length >= 8
                            ? COLORS.success
                            : password.length >= 6
                              ? COLORS.gold
                              : COLORS.danger,
                      },
                    ]}
                  />
                  <Text style={styles.strengthText}>
                    {password.length >= 8
                      ? "💪 Strong"
                      : password.length >= 6
                        ? "👍 Good"
                        : "⚠️ Too short"}
                  </Text>
                </View>
              )}

              <Button
                label="Create My Account"
                onPress={handleSignUp}
                variant="accent"
                size="lg"
                loading={loading}
                emoji="✨"
                style={styles.signUpBtn}
              />

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreedToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreedToTerms && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() =>
                      Linking.openURL(
                        "https://kts1979-debug.github.io/Scavlandia-mobile/terms-of-service",
                      )
                    }
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() =>
                      Linking.openURL(
                        "https://kts1979-debug.github.io/Scavlandia-mobile/privacy-policy",
                      )
                    }
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  bgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(25, 50, 85, 0.72)",
  },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  logoIcon: { width: 64, height: 64, marginBottom: SPACING.sm },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.lg,
  },
  fieldGroup: { marginBottom: SPACING.sm },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderRadius: RADIUS.md,
    padding: 14,
    fontSize: FONTS.sizes.md,
    color: COLORS.black,
    backgroundColor: COLORS.offWhite,
  },
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  strengthBar: { height: 4, flex: 1, borderRadius: RADIUS.round },
  strengthText: { fontSize: FONTS.sizes.sm, color: COLORS.darkGray, width: 80 },
  signUpBtn: { marginTop: SPACING.md },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "rgba(255,255,255,0.75)", fontSize: FONTS.sizes.md },
  footerLink: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.heavy,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.midGray,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  checkboxTick: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONTS.weights.heavy,
  },
  termsText: {
    flex: 1,
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
    textDecorationLine: "underline",
  },
});
