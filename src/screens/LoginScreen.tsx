// src/screens/LoginScreen.tsx — Playful redesign
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email address");
    if (!password.trim())
      return Alert.alert("Missing info", "Please enter your password");

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Sign in failed. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No account found with this email.";
      if (error.code === "auth/wrong-password")
        message = "Incorrect password. Please try again.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      if (error.code === "auth/too-many-requests")
        message = "Too many attempts. Please try again later.";
      if (error.code === "auth/invalid-credential")
        message = "Email or password is incorrect.";
      Alert.alert("Sign In Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>🗺️</Text>
            <Text style={styles.appName}>Scavlandia</Text>
            <Text style={styles.tagline}>Your next adventure awaits</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back!</Text>
            <Text style={styles.formSubtitle}>
              Sign in to continue your adventures
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
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={COLORS.midGray}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showPassBtn}
                onPress={() => setShowPass(!showPass)}
              >
                <Text style={styles.showPassText}>
                  {showPass ? "🙈" : "👁️"}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              label="Sign In"
              onPress={handleSignIn}
              variant="accent"
              size="lg"
              loading={loading}
              emoji="🚀"
              style={styles.signInBtn}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              <Text>{"Don't have an account?"}</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.footerLink}>Create one free</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: SPACING.lg },
  logoSection: { alignItems: "center", marginBottom: SPACING.xl },
  logoEmoji: { fontSize: 72, marginBottom: SPACING.sm },
  appName: {
    fontSize: FONTS.sizes.hero,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  tagline: { fontSize: FONTS.sizes.md, color: "#AED6F1" },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: SPACING.sm,
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
  passwordRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  passwordInput: { flex: 1 },
  showPassBtn: { padding: 8 },
  showPassText: { fontSize: 20 },
  signInBtn: { marginTop: SPACING.lg },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#AED6F1", fontSize: FONTS.sizes.md },
  footerLink: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
