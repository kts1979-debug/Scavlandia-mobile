// src/navigation/AppNavigator.tsx
// This file defines ALL the screens in your app and how to navigate between them.
// Think of it as the table of contents for your entire app.

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Text } from "react-native";

// Import all screen components (you will create these in steps 5.2–5.7)
import ActiveHuntScreen from "../screens/ActiveHuntScreen";
import GeneratingScreen from "../screens/GeneratingScreen";
import GroupProfileScreen from "../screens/GroupProfileScreen";
import HistoryScreen from "../screens/HistoryScreen";
import HomeScreen from "../screens/HomeScreen";
import HuntCompleteScreen from "../screens/HuntCompleteScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom Tab Navigator ─────────────────────────────────────────
// These are the main sections accessible via tabs at the bottom
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1A5276",
        tabBarInactiveTintColor: "#95A5A6",
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "Past Hunts",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Main Stack Navigator ─────────────────────────────────────────
// The full app flow — tabs plus the hunt creation and gameplay screens
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Main tabs */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Hunt creation flow — these slide up over the tabs */}
        <Stack.Screen
          name="GroupProfile"
          component={GroupProfileScreen}
          options={{
            presentation: "modal",
            headerShown: true,
            title: "Your Group",
          }}
        />
        <Stack.Screen
          name="Generating"
          component={GeneratingScreen}
          options={{ headerShown: false }}
        />

        {/* Active hunt — full screen, no tabs */}
        <Stack.Screen
          name="ActiveHunt"
          component={ActiveHuntScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HuntComplete"
          component={HuntCompleteScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
