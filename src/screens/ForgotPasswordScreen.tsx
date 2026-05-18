// src/screens/ForgotPasswordScreen.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const BG_IMAGE = require("../../assets/images/hunt_bg_3_friends_nyc.jpg");
const LOGO_ICON = require("../../assets/images/icon_white_1024.png");

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email address");

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (error: any) {
      let message = "Could not send reset email. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No account found with this email address.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={BG_IMAGE} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Image
                source={LOGO_ICON}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Scavlandia</Text>
            </View>

            {/* Card */}
            <View style={styles.formCard}>
              {sent ? (
                /* Success state */
                <View style={styles.successContainer}>
                  <Text style={styles.successEmoji}>📧</Text>
                  <Text style={styles.successTitle}>Check your email</Text>
                  <Text style={styles.successDesc}>
                    We sent a password reset link to{" "}
                    <Text style={styles.successEmail}>{email}</Text>. Check your
                    inbox and follow the link to reset your password.
                  </Text>
                  <Button
                    label="Back to Sign In"
                    onPress={() => router.replace("/login")}
                    variant="accent"
                    size="lg"
                    style={styles.backBtn}
                  />
                </View>
              ) : (
                /* Input state */
                <>
                  <Text style={styles.formTitle}>Reset Password</Text>
                  <Text style={styles.formSubtitle}>
                    {
                      "Enter your email and we'll send you a link to reset your password."
                    }
                  </Text>

                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.midGray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />

                  <Button
                    label="Send Reset Link"
                    onPress={handleReset}
                    variant="accent"
                    size="lg"
                    loading={loading}
                    style={styles.submitBtn}
                  />

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.cancelText}>← Back to Sign In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
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
  content: { flex: 1, justifyContent: "center", padding: SPACING.lg },
  logoSection: { alignItems: "center", marginBottom: SPACING.xl },
  logoIcon: { width: 64, height: 64, marginBottom: SPACING.sm },
  appName: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.lg,
  },
  formTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
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
    backgroundColor: "rgba(232,248,247,0.75)",
    marginBottom: SPACING.md,
  },
  submitBtn: { marginBottom: SPACING.sm },
  cancelBtn: { alignItems: "center", padding: SPACING.sm },
  cancelText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  successContainer: { alignItems: "center" },
  successEmoji: { fontSize: 56, marginBottom: SPACING.md },
  successTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  successDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  successEmail: { fontWeight: FONTS.weights.bold, color: COLORS.primary },
  backBtn: { width: "100%" },
});
