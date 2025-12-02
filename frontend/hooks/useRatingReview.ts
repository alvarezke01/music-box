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
  loading: boolean; // fetching existing rating/review
  error: string | null; // fetch error
  saving: boolean; // saving rating/review
  saveError: string | null; // save error
  refetch: () => Promise<void>;
  saveRatingReview: (args: {
    item: SelectedItem;
    rating: number | null;
    review: string | null;
  }) => Promise<boolean>;
};

/**
 * Hook to load + save the current user's rating & review for a given item.
 *
 * - Automatically fetches when `visible` is true and `item` is set.
 * - Exposes a `saveRatingReview` function for saving rating/review.
 * - Uses sequential POSTs (rating then review) to avoid SQLite write locking.
 */
export const useRatingReview = (
  item: SelectedItem,
  visible: boolean
): UseRatingReviewResult => {
  const { accessToken, isAuthenticated } = useAuth();

  const [data, setData] = useState<RatingReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch existing rating + review
  const fetchData = useCallback(async () => {
    if (!item || !visible) return;

    if (!accessToken || !isAuthenticated) {
      setData(null);
      setError("Not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ratingUrl =
        `${API_BASE_URL}/ratings/item/` +
        `?spotify_id=${encodeURIComponent(item.id)}&item_type=${item.itemType}`;

      const reviewUrl =
        `${API_BASE_URL}/reviews/item/` +
        `?spotify_id=${encodeURIComponent(item.id)}&item_type=${item.itemType}`;

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

      const ratingFromApi = await (async () => {
        if (!ratingRes.ok) {
          console.warn("rating item request failed:", ratingRes.status);
          return null;
        }
        const ratingJson: any = await ratingRes.json();
        if (!ratingJson.exists || !ratingJson.rating) return null;

        const parsed = parseFloat(String(ratingJson.rating.rating));
        return Number.isNaN(parsed) ? null : parsed;
      })();

      const reviewFromApi = await (async () => {
        if (!reviewRes.ok) {
          console.warn("review item request failed:", reviewRes.status);
          return null;
        }
        const reviewJson: any = await reviewRes.json();
        if (!reviewJson.exists || !reviewJson.review) return null;

        const text: string | undefined = reviewJson.review.text;
        return typeof text === "string" ? text : null;
      })();

      setData({
        itemId: item.id,
        rating: ratingFromApi,
        review: reviewFromApi,
      });
    } catch (err: any) {
      console.error("useRatingReview fetch error:", err);
      setError(err.message ?? "Failed to fetch rating/review.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [item, visible, accessToken, isAuthenticated]);

  // when overlay closes or item is cleared, reset local state
  useEffect(() => {
    if (!item || !visible) return;
    fetchData();
  }, [item, visible, fetchData]);


  // Save rating + review 
  const saveRatingReview = useCallback(
    async (args: {
      item: SelectedItem;
      rating: number | null; // null => don't save rating
      review: string | null; // null/blank => don't save review
    }): Promise<boolean> => {
      const { item: saveItem, rating, review } = args;

      if (!saveItem) return false;

      if (!accessToken || !isAuthenticated) {
        setSaveError("Not authenticated");
        return false;
      }

      const shouldSaveRating = rating !== null;
      const shouldSaveReview =
        review !== null && review.trim() !== "";


      if (!shouldSaveRating && !shouldSaveReview) {
        return true;
      }

      try {
        setSaving(true);
        setSaveError(null);

        // 1) Save rating (if provided)
        if (shouldSaveRating) {
          const ratingRes = await fetch(`${API_BASE_URL}/ratings/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spotify_id: saveItem.id,
              item_type: saveItem.itemType,
              item_name: saveItem.title,
              rating,
            }),
          });

          if (!ratingRes.ok) {
            const msg = `Save rating failed with status ${ratingRes.status}`;
            setSaveError(msg);
            return false;
          }
        }

        // 2) Save review (if provided)
        if (shouldSaveReview) {
          const reviewRes = await fetch(`${API_BASE_URL}/reviews/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              spotify_id: saveItem.id,
              item_type: saveItem.itemType,
              item_name: saveItem.title,
              text: review.trim(),
            }),
          });

          if (!reviewRes.ok) {
            const msg = `Save review failed with status ${reviewRes.status}`;
            setSaveError(msg);
            return false;
          }
        }

        // 3) Update local cache so overlay re-opens with latest values
        const previous = data ?? {
          itemId: saveItem.id,
          rating: null,
          review: null,
        };

        const nextRating = shouldSaveRating ? rating : previous.rating;
        const nextReview = shouldSaveReview ? review : previous.review;

        setData({
          itemId: saveItem.id,
          rating: nextRating,
          review: nextReview,
        });

        return true;
      } catch (err: any) {
        console.error("useRatingReview save error:", err);
        setSaveError(err.message ?? "Failed to save rating/review.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [accessToken, isAuthenticated, data]
  );

  return {
    data,
    loading,
    error,
    saving,
    saveError,
    refetch: fetchData,
    saveRatingReview,
  };
};


