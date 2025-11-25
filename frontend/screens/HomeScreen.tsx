import React from "react";
import { View, Text } from "react-native";
import { homeStyles } from "./styles/homeStyles";

export const HomeScreen: React.FC = () => {
  return (
    <View style={homeStyles.container}>
      <Text style={homeStyles.title}>Music Box</Text>
      <Text style={homeStyles.subtitle}>
        HomeScreen: Song of the Day, Now Playing
      </Text>
    </View>
  );
};
