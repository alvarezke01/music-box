import "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "./screens/HomeScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

export type RootTabParamList = {
  Home: undefined;
  Discover: undefined;
  Library: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#050814",
            borderTopColor: "#151822",
          },
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#888ba0",
          tabBarLabelStyle: {
            fontSize: 11,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Discover") {
              iconName = "search-outline";
            } else if (route.name === "Library") {
              iconName = "musical-notes-outline";
            } else if (route.name === "Profile") {
              iconName = "person-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

