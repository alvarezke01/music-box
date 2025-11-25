import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import * as Linking from "expo-linking";
import { loginStyles } from "./styles/loginStyles";
import { API_BASE_URL } from "../config";

export const LoginScreen: React.FC = () => {
  const handleConnectSpotify = () => {
    const loginUrl = `${API_BASE_URL}/auth/spotify/login/`;

    if (Platform.OS === "web") {
      // On web: full redirect to backend which will redirect to Spotify
      window.location.href = loginUrl;
    } else {
      // On native: open external browser
      Linking.openURL(loginUrl);
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Welcome to Music Box</Text>
      <Text style={loginStyles.subtitle}>
        Connect your Spotify account to unlock personalized music insights,
        daily recommendations, and your listening history.
      </Text>

      <TouchableOpacity
        style={loginStyles.button}
        onPress={handleConnectSpotify}
        activeOpacity={0.8}
      >
        <Text style={loginStyles.buttonText}>Connect with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
};
