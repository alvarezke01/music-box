import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { itemCardStyles, itemCardStyles as Styles} from "./styles/itemCardStyles";

export type ItemType = "track" | "album" | "artist";

export type ItemCardProps = {
  id: string;
  itemType: ItemType;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export const ItemCard: React.FC<ItemCardProps> = ({
  imageUrl,
  itemType,
  title,
  subtitle,
  onPress,
}) => {
  const isArtist = itemType === "artist";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        itemCardStyles.cardContainer,
        pressed && itemCardStyles.cardPressed,
      ]}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={isArtist ? itemCardStyles.artistImage : itemCardStyles.squareImage}
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
