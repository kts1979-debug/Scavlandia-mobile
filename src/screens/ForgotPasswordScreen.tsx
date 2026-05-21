import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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

  const handleSend = async () => {
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email address.");

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
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoSection}>
              <Image
                source={LOGO_ICON}
                style={styles.logoIcon}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Scavlandia</Text>
            </View>

            <View style={styles.formCard}>
              {sent ? (
                // ── Success state ───────────────────────────────
                <View style={styles.successSection}>
                  <Text style={styles.successEmoji}>📬</Text>
                  <Text style={styles.formTitle}>Check your inbox</Text>
                  <Text style={styles.formSubtitle}>
                    We sent a password reset link to{" "}
                    <Text style={styles.emailHighlight}>{email}</Text>. Check
                    your spam folder if you don't see it.
                  </Text>
                  <Button
                    label="Back to Sign In"
                    onPress={() => router.replace("/login")}
                    variant="accent"
                    size="lg"
                    style={styles.btn}
                  />
                </View>
              ) : (
                // ── Form state ──────────────────────────────────
                <>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.backBtnText}>‹ Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.formTitle}>Reset your password</Text>
                  <Text style={styles.formSubtitle}>
                    Enter your email and we'll send you a link to reset your
                    password.
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
                    onPress={handleSend}
                    variant="accent"
                    size="lg"
                    loading={loading}
                    style={styles.btn}
                  />
                </>
              )}
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
  scroll: { flexGrow: 1, justifyContent: "center", padding: SPACING.lg },
  logoSection: { alignItems: "center", marginBottom: SPACING.xl },
  logoIcon: { width: 72, height: 72, marginBottom: SPACING.sm },
  appName: {
    fontSize: FONTS.sizes.hero,
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
  backBtn: { marginBottom: SPACING.md },
  backBtnText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
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
    marginBottom: SPACING.sm,
  },
  btn: { marginTop: SPACING.md },
  successSection: { alignItems: "center" },
  successEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emailHighlight: { fontWeight: FONTS.weights.bold, color: COLORS.primary },
});
