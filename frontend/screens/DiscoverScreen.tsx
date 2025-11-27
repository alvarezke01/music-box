import React, { useState } from "react";
import { View, Text } from "react-native";
import { discoverStyles } from "./styles/discoverStyles";
import { SearchBar } from "../components/SearchBar";
export const DiscoverScreen: React.FC = () => {
  const [query, setQuery] = useState("");

  return (
    <View style={discoverStyles.container}>
      <Text style={discoverStyles.title}>Discover</Text>
      <Text style={discoverStyles.subtitle}>
        Explore new artists, genres, and Song of the Day.
      </Text>

      {/* Search bar (not wired yet) */}
      <View style={{ marginTop: 20 }}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>
    </View>
  );
};

