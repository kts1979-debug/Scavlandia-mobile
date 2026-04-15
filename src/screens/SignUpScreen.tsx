// src/screens/SignUpScreen.tsx — Playful redesign
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

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace("/(tabs)");
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

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    secure = false,
    keyboardType = "default" as any,
  }: any) => (
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🎉</Text>
            <Text style={styles.headerTitle}>Join Daytripper</Text>
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

            {/* Password strength indicator */}
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

            <Text style={styles.terms}>
              By signing up you agree to our Terms of Service and Privacy Policy
            </Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg, paddingBottom: 40 },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  headerEmoji: { fontSize: 60, marginBottom: SPACING.sm },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.heavy,
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: FONTS.sizes.md,
    color: "#AED6F1",
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
  terms: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.midGray,
    textAlign: "center",
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
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
