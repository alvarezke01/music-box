import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../auth/AuthContext";
import type { SelectedItem } from "./selectItemCard";

export type RatingReviewData = {
  itemId: string;          //  spotify id data belongs to
  rating: number | null;
  review: string | null;
};

type UseRatingReviewResult = {
  data: RatingReviewData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetches the current user's rating + review for a selected item.
 *
 * - Fires automatically when `visible` is true and `item` is set.
 * - Returns loading + error state and the combined data.
 */
export const useRatingReview = (
  item: SelectedItem,
  visible: boolean
): UseRatingReviewResult => {
  const { accessToken, isAuthenticated } = useAuth();
  const [data, setData] = useState<RatingReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!item || !visible) return;
    if (!accessToken || !isAuthenticated) {
      setData(null);
      setError("Not authenticated");
      return;
    }

    const currentItemId = item.id; // capture id at start of fetch

    try {
      setLoading(true);
      setError(null);

      const ratingUrl =
        `${API_BASE_URL}/ratings/item/` +
        `?spotify_id=${encodeURIComponent(currentItemId)}&item_type=${item.itemType}`;

      const reviewUrl =
        `${API_BASE_URL}/reviews/item/` +
        `?spotify_id=${encodeURIComponent(currentItemId)}&item_type=${item.itemType}`;

      const [ratingRes, reviewRes] = await Promise.all([
        fetch(ratingUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        fetch(reviewUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      let rating: number | null = null;
      let review: string | null = null;

      if (ratingRes.ok) {
        const ratingJson: any = await ratingRes.json();
        if (ratingJson.exists && ratingJson.rating) {
          const raw = parseFloat(String(ratingJson.rating.rating));
          rating = Number.isNaN(raw) ? null : raw;
        }
      } else {
        console.warn("rating item request failed:", ratingRes.status);
      }

      if (reviewRes.ok) {
        const reviewJson: any = await reviewRes.json();
        if (reviewJson.exists && reviewJson.review) {
          review = reviewJson.review.text ?? "";
        }
      } else {
        console.warn("review item request failed:", reviewRes.status);
      }

      // tag result with the item id this fetch was for
      setData({ itemId: currentItemId, rating, review });
    } catch (err: any) {
      console.error("useRatingReview error:", err);
      setError(err.message ?? "Failed to fetch rating/review.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [item, visible, accessToken, isAuthenticated]);

  // when overlay closes or item is cleared, reset local state
  useEffect(() => {
    if (!visible || !item) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    // normal case: visible + item => fetch
    fetchData();
  }, [item, visible, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};


