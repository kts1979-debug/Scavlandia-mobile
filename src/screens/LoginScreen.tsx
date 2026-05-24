// src/screens/LoginScreen.tsx
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { COLORS, FONTS, RADIUS, SHADOW, SPACING } from "../theme";

const BG_IMAGE = require("../../assets/images/hunt_bg_3_friends_nyc.jpg");
const LOGO_ICON = require("../../assets/images/icon_white_1024.png");

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code !== "SIGN_IN_CANCELLED") {
        Alert.alert(
          "Google Sign In Failed",
          "Could not sign in with Google. Please try again.",
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert(
          "Apple Sign In Failed",
          "Could not sign in with Apple. Please try again.",
        );
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero background */}
      <Image source={BG_IMAGE} style={styles.bgImage} resizeMode="cover" />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <Image
                  source={LOGO_ICON}
                  style={styles.logoIcon}
                  resizeMode="contain"
                />
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
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    <Text style={styles.eyeIcon}>
                      {showPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Forgot password */}
                <TouchableOpacity
                  style={styles.forgotBtn}
                  onPress={() => router.push("/forgot-password")}
                >
                  <Text style={styles.forgotText}>Forgot your password?</Text>
                </TouchableOpacity>

                <Button
                  label="Sign In"
                  onPress={handleSignIn}
                  variant="accent"
                  size="lg"
                  loading={loading}
                  style={styles.signInBtn}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.ssoColumn}>
                  {/* Apple Sign In */}
                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.ssoBtnApple}
                      onPress={handleAppleSignIn}
                      disabled={appleLoading}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.ssoBtnAppleIcon}>🍎</Text>
                      <Text style={styles.ssoBtnAppleText}>
                        Continue with Apple
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* Google Sign In */}
                  <TouchableOpacity
                    style={styles.ssoBtnGoogle}
                    onPress={handleGoogleSignIn}
                    disabled={googleLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ssoBtnGoogleIcon}>G</Text>
                    <Text style={styles.ssoBtnGoogleText}>
                      Continue with Google
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {"Don't have an account? "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/signup")}>
                  <Text style={styles.footerLink}>Create one free</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
    marginBottom: 4,
    letterSpacing: 1,
  },
  tagline: { fontSize: FONTS.sizes.md, color: "rgba(255,255,255,0.7)" },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
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
    backgroundColor: "rgba(232,248,247,0.75)",
  },
  forgotBtn: { alignSelf: "flex-end", marginTop: 8, marginBottom: 4 },
  forgotText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  signInBtn: { marginTop: SPACING.md },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.lightGray },
  dividerText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.darkGray,
    fontWeight: FONTS.weights.medium,
  },
  ssoColumn: { gap: SPACING.sm, marginTop: SPACING.lg },
  ssoBtnApple: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  ssoBtnAppleIcon: { fontSize: 20, color: COLORS.white },
  ssoBtnAppleText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  ssoBtnGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  ssoBtnGoogleIcon: {
    fontSize: 18,
    fontWeight: FONTS.weights.heavy,
    backgroundColor: COLORS.white,
    color: "#4285F4",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
  },
  ssoBtnGoogleText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
  ssoBtnText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
    color: COLORS.black,
  },
  ssoBtnTextApple: { color: COLORS.white },
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
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.midGray,
    borderLeftWidth: 0,
    borderTopRightRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
    padding: 14,
    backgroundColor: "rgba(232,248,247,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIcon: { fontSize: 18 },
});
