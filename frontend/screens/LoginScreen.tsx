import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { loginStyles } from "./styles/loginStyles";
import { useAuth } from "../auth/AuthContext";

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Welcome to Music Box</Text>
      <Text style={loginStyles.subtitle}>
        Connect your Spotify account to unlock personalized music insights,
        daily recommendations, and your listening history.
      </Text>

      <TouchableOpacity
        style={loginStyles.button}
        onPress={login}
        activeOpacity={0.8}
      >
        <Text style={loginStyles.buttonText}>Connect with Spotify</Text>
      </TouchableOpacity>
    </View>
  );
};
