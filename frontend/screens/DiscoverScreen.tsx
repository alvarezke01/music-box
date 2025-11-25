import React from "react";
import { View, Text } from "react-native";
import { discoverStyles } from "./styles/discoverStyles";

export const DiscoverScreen: React.FC = () => {
  return (
    <View style={discoverStyles.container}>
      <Text style={discoverStyles.title}>Discover</Text>
      <Text style={discoverStyles.subtitle}>
        Explore new artists, genres, and Song of the Day.
      </Text>
    </View>
  );
};
