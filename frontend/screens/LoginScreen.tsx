import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { loginStyles } from "./styles/loginStyles";

export const LoginScreen: React.FC = () => {

  const handleConnectSpotify = () => {
    // TODO: call backend /auth/spotify/login/ and handle redirect
    console.log("Connect with Spotify pressed");
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
