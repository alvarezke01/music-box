import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { itemCardStyles } from "./styles/itemCardStyles";

export type ItemType = "track" | "album" | "artist";

export type ItemCardProps = {
  id: string;
  itemType: ItemType;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  onPress?: () => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  imageUrl,
  itemType,
  title,
  subtitle,
  isSelected,
  onPress,
}) => {
  const isArtist = itemType === "artist";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        itemCardStyles.cardContainer,
        isSelected && itemCardStyles.cardSelected,
        pressed && itemCardStyles.cardPressed,
      ]}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={
            isArtist
              ? itemCardStyles.artistImage
              : itemCardStyles.squareImage
          }
        />
      )}
      <View style={itemCardStyles.textContainer}>
        <Text style={itemCardStyles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={itemCardStyles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

