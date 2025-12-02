import React, { useEffect, useRef, useState, useCallback } from "react";
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

  const flipAnim = useRef(new Animated.Value(0)).current;
  const initializedRef = useRef<string | null>(null);

  const {
    data,
    loading,
    error,
    saving,
    saveError,
    saveRatingReview,
  } = useRatingReview(item, visible);

  // When overlay opens for a given item: reset inputs + animation
  useEffect(() => {
    if (!visible || !item) return;

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

  // Initialize rating/review from backend once per open
  useEffect(() => {
    if (!visible || !item) return;
    if (!data) return;
    if (data.itemId !== item.id) return;

    // already initialized for this item during this open
    if (initializedRef.current === item.id) return;

    const backendRating = data.rating;
    const backendReview = data.review;

    setRatingInput(
      backendRating != null ? backendRating.toFixed(2) : ""
    );
    setReviewInput(backendReview ?? "");

    initializedRef.current = item.id;
  }, [visible, item, data]);

  // Numeric rating for star fill (0–5)
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

  /**
   * Disable Save when:
   *  - there is no user input at all, OR
   *  - the normalized rating & review match the backend values (no changes).
   */
  const nothingToSave = (() => {
    const ratingStr = ratingInput.trim();
    const reviewStr = reviewInput.trim();

    const hasValidRating =
      ratingStr !== "" && !Number.isNaN(parseFloat(ratingStr));
    const hasReview = reviewStr !== "";

    const currentRating = hasValidRating
      ? Math.min(5, Math.max(0, parseFloat(ratingStr)))
      : null;
    const currentReview = hasReview ? reviewStr : null;

    // Backend baseline
    const backendRating = data?.rating ?? null;
    const backendReviewRaw = data?.review ?? null;
    const backendReview =
      backendReviewRaw === null
        ? null
        : backendReviewRaw.trim() === ""
        ? null
        : backendReviewRaw.trim();

    const noUserInput = !hasValidRating && !hasReview;

    const noDiff =
      currentRating === backendRating &&
      (currentReview ?? null) === backendReview;

    return noUserInput || noDiff;
  })();

  const handleSave = useCallback(
    async () => {
      if (!item) return;

      const ratingStr = ratingInput.trim();
      const parsed = parseFloat(ratingStr);

      const rating =
        ratingStr === "" || Number.isNaN(parsed)
          ? null
          : Math.min(5, Math.max(0, parsed));

      const reviewStr = reviewInput.trim();
      const review = reviewStr === "" ? null : reviewStr;

      const ok = await saveRatingReview({
        item,
        rating,
        review,
      });

      if (ok) {
        onClose();
      }
    },
    [item, ratingInput, reviewInput, saveRatingReview, onClose]
  );

  // Early return AFTER hooks
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

            {loading && (
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

            {(error || saveError) && (
              <Text style={styles.errorText}>
                {saveError || error}
              </Text>
            )}

            {/* Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={nothingToSave || saving}
                style={[
                  styles.primaryButton,
                  (nothingToSave || saving) &&
                    styles.primaryButtonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  {saving ? "Saving…" : "Save"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

