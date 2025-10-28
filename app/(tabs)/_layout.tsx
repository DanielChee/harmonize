// Pass: 
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="match"
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#6C5CE7",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen
        name="match"
        options={{
          title: "Match",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="concerts"
        options={{
          title: "Concerts",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meet"
        options={{
          title: "Meet",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
