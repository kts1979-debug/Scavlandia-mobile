// src/screens/LoginScreen.tsx
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // Basic validation before calling Firebase
    if (!email.trim())
      return Alert.alert("Missing info", "Please enter your email address");
    if (!password.trim())
      return Alert.alert("Missing info", "Please enter your password");

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // On success, navigate to home and remove login from back stack
      router.replace("/(tabs)");
    } catch (error: any) {
      // Firebase returns specific error codes — show helpful messages
      let message = "Sign in failed. Please try again.";
      if (error.code === "auth/user-not-found")
        message = "No account found with this email address.";
      if (error.code === "auth/wrong-password")
        message = "Incorrect password. Please try again.";
      if (error.code === "auth/invalid-email")
        message = "Please enter a valid email address.";
      if (error.code === "auth/too-many-requests")
        message = "Too many failed attempts. Please try again later.";
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
        >
          {/* Logo and title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🗺️</Text>
            <Text style={styles.appName}>Daytripper</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="Your password"
              placeholderTextColor="#BDC3C7"
              secureTextEntry={true}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link to sign up */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>

          {/* Skip for now — temporary, remove before launch */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.skipText}>Skip for now (testing only)</Text>
          </TouchableOpacity>
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
  signInButton: {
    backgroundColor: "#1A5276",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  signInButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  footerText: { color: "#AED6F1", fontSize: 15 },
  footerLink: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  skipButton: { alignItems: "center", padding: 12 },
  skipText: { color: "#7FB3D3", fontSize: 13 },
});
