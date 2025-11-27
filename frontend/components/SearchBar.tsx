import React from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputSubmitEditingEventData,
  NativeSyntheticEvent,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchBarStyles as styles } from "./styles/searchBarStyles";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search for tracks, albums, artists...",
  autoFocus = false,
}) => {
  const handleSubmit = (
    _e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    if (onSubmit) onSubmit();
  };

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#9ca3af"
          style={styles.icon}
        />

        <TextInput
          style={[
            styles.input,
            Platform.OS === "web"
              ? ({
                  outlineStyle: "none",
                  outlineWidth: 0,
                  outlineColor: "transparent",
                } as any)
              : null,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onSubmitEditing={handleSubmit}
          underlineColorAndroid="transparent"
        />

        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
