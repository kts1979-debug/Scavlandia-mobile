import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { COLORS } from "../../src/theme";

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return (
    <Text
      style={{
        fontSize: 22,
        opacity: color === COLORS.accent ? 1 : 0.75,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}
    >
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
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: Platform.OS === "android" ? 90 : 84,
          paddingBottom: Platform.OS === "android" ? 30 : 24,
          paddingTop: Platform.OS === "android" ? 8 : 0,
        },
        // ← Add this:
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="active-hunt"
        options={{
          title: "Active",
          tabBarIcon: ({ color }) => <TabIcon emoji="▶️" color={color} />,
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

      {/* ── Hidden tabs (show tab bar but not in tab bar UI) ── */}
      <Tabs.Screen name="hunt-complete" options={{ href: null }} />
      <Tabs.Screen name="stop-complete" options={{ href: null }} />
      <Tabs.Screen name="hunt-setup" options={{ href: null }} />
      <Tabs.Screen name="safety-warning" options={{ href: null }} />
      <Tabs.Screen name="hunt-detail" options={{ href: null }} />
      <Tabs.Screen name="join-hunt" options={{ href: null }} />
      <Tabs.Screen name="hunt-type" options={{ href: null }} />
      <Tabs.Screen name="hunt-style" options={{ href: null }} />
      <Tabs.Screen name="group-profile" options={{ href: null }} />
      <Tabs.Screen name="road-trip" options={{ href: null }} />
      <Tabs.Screen name="micro-hunt" options={{ href: null }} />
      <Tabs.Screen name="paywall" options={{ href: null }} />
      <Tabs.Screen name="photo-album" options={{ href: null }} />
      <Tabs.Screen name="add-stop" options={{ href: null }} />
    </Tabs>
  );
}
