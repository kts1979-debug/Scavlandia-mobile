import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1A5276",
        tabBarInactiveTintColor: "#95A5A6",
        tabBarStyle: {
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 84 : 68,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Past Hunts",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>📋</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
