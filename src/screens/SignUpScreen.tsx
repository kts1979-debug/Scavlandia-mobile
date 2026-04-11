// src/screens/SignUpScreen.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "../context/AuthContext";

export default function SignUpScreen() {
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validate all fields
    if (!displayName.trim())
      return Alert.alert("Missing info", "Please enter your name");
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email address");
    if (!password.trim())
      return Alert.alert("Missing info", "Please enter a password");
    if (password.length < 6)
      return Alert.alert(
        "Weak password",
        "Password must be at least 6 characters",
      );
    if (password !== confirmPassword)
      return Alert.alert("Password mismatch", "Passwords do not match");

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Sign up failed. Please try again.";
      if (error.code === "auth/email-already-in-use")
        message =
          "An account with this email already exists. Try signing in instead.";
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🗺️</Text>
            <Text style={styles.appName}>Daytripper</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor="#BDC3C7"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#BDC3C7"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor="#BDC3C7"
              secureTextEntry={true}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Type your password again"
              placeholderTextColor="#BDC3C7"
              secureTextEntry={true}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

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
  container: { flex: 1, backgroundColor: "#1A5276" },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 30 },
  header: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#AED6F1" },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A5276",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D5D8DC",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#2C3E50",
    backgroundColor: "#F8F9FA",
  },
  signUpButton: {
    backgroundColor: "#27AE60",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#AED6F1", fontSize: 15 },
  footerLink: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
