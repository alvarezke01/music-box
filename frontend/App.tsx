import "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "./screens/HomeScreen";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";

import { AuthProvider, useAuth } from "./auth/AuthContext";

export type RootTabParamList = {
  Home: undefined;
  Discover: undefined;
  Library: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050814",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
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
              let iconName: string = "home-outline";

              if (route.name === "Home") iconName = "home-outline";
              if (route.name === "Discover") iconName = "search-outline";
              if (route.name === "Library") iconName = "musical-notes-outline";
              if (route.name === "Profile") iconName = "person-outline";

              return (
                <Ionicons name={iconName as any} size={size} color={color} />
              );
            },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Discover" component={DiscoverScreen} />
          <Tab.Screen name="Library" component={LibraryScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
