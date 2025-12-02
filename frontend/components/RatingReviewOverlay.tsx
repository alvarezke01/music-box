import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ratingReviewOverlayStyles as styles } from "./styles/ratingReviewOverlayStyles";
import { useRatingReview } from "../hooks/useRatingReview";
import type { SelectedItem } from "../hooks/selectItemCard";

const STAR_SIZE = 20;

type RatingReviewOverlayProps = {
  visible: boolean;
  item: SelectedItem;
  onClose: () => void;
};

export const RatingReviewOverlay: React.FC<RatingReviewOverlayProps> = ({
  visible,
  item,
  onClose,
}) => {
  const [ratingInput, setRatingInput] = useState<string>("");
  const [reviewInput, setReviewInput] = useState<string>("");

  // fetch existing rating + review for this item
  const {
    data,
    loading: loadingExisting,
    error,
  } = useRatingReview(item, visible);

  // track if already initialized from backend for this item/open
  const initializedRef = useRef<string | null>(null);

  // zoom + flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Effect 1: whenever we open the overlay for an item
  useEffect(() => {
    if (!visible || !item) return;

    // reset local state on open / item change
    setRatingInput("");
    setReviewInput("");
    initializedRef.current = null;

    flipAnim.setValue(0);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, item, flipAnim]);

  // Effect 2: initialize inputs from backend data exactly once per open
  useEffect(() => {
    if (!visible || !item || !data) return;

    // make sure data we have belongs to item
    if (data.itemId !== item.id) return;

    // already initialized for this item during this open
    if (initializedRef.current === item.id) return;

    const backendRating = data.rating; // number | null
    const backendReview = data.review; // string | null

    setRatingInput(
      backendRating != null ? backendRating.toFixed(2) : ""
    );
    setReviewInput(backendReview ?? "");

    initializedRef.current = item.id;
  }, [visible, item, data]);

  if (!visible || !item) return null;

  const animatedCardStyle = {
    transform: [
      {
        scale: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
      {
        rotateY: flipAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-90deg", "0deg"],
        }),
      },
    ],
  };

  // parse rating 0–5
  const numericRating = (() => {
    const num = parseFloat(ratingInput);
    if (isNaN(num)) return 0;
    return Math.min(5, Math.max(0, num));
  })();

  // fractional star fill (supports 3.35, 4.75, etc.)
  const renderStars = () => {
    const stars = [1, 2, 3, 4, 5];

    return stars.map((starIndex) => {
      const fillLevel = Math.min(
        Math.max(numericRating - (starIndex - 1), 0),
        1
      ); // 0–1 for this star

      return (
        <Pressable
          key={starIndex}
          style={styles.starPressArea}
          onPress={() => setRatingInput(starIndex.toFixed(2))}
        >
          <View style={styles.starContainer}>
            <Ionicons
              name="star-outline"
              size={STAR_SIZE}
              color="#4b5563"
              style={styles.starBase}
            />
            <View
              style={[
                styles.starFillMask,
                { width: STAR_SIZE * fillLevel },
              ]}
            >
              <Ionicons
                name="star"
                size={STAR_SIZE}
                color="#facc15"
                style={styles.starFill}
              />
            </View>
          </View>
        </Pressable>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.selectedOverlay}
    >
      <View style={styles.overlayInner}>
        <Animated.View style={[styles.selectedCard, animatedCardStyle]}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.selectedCardContent}
          >
            {item.imageUrl && (
              <View style={styles.selectedImageWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.selectedImage}
                />
              </View>
            )}

            <Text style={styles.selectedTitle}>{item.title}</Text>
            {item.subtitle ? (
              <Text style={styles.selectedSubtitle}>{item.subtitle}</Text>
            ) : null}
            <Text style={styles.selectedMeta}>
              {item.itemType.toUpperCase()}
            </Text>

            {loadingExisting && (
              <Text style={styles.loadingExistingText}>
                Loading your previous rating…
              </Text>
            )}

            {/* Rating row */}
            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>{renderStars()}</View>
              <TextInput
                style={styles.ratingInput}
                placeholder="0–5"
                placeholderTextColor="#6b7280"
                keyboardType="decimal-pad"
                value={ratingInput}
                onChangeText={setRatingInput}
              />
            </View>

            {/* Review input */}
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review…"
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
              value={reviewInput}
              onChangeText={setReviewInput}
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>

              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Save (not wired yet)
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};
