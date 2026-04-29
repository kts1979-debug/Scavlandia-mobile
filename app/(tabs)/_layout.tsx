import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { COLORS } from "../../src/theme";

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <Text style={{ fontSize: 22, opacity: color === COLORS.accent ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.midGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: Platform.OS === "android" ? 68 : 84,
          paddingBottom: Platform.OS === "android" ? 12 : 24,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <TabIcon emoji="📖" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
