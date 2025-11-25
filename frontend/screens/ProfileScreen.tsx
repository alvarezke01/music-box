import React from "react";
import { View, Text } from "react-native";
import { profileStyles } from "./styles/profileStyles";

export const ProfileScreen: React.FC = () => {
  return (
    <View style={profileStyles.container}>
      <Text style={profileStyles.title}>Profile</Text>
      <Text style={profileStyles.subtitle}>
        Listening stats and settings here.
      </Text>
    </View>
  );
};
