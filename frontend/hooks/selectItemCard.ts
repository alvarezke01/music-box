import { useCallback, useState } from "react";
import { ItemType } from "../components/ItemCard";

export type SelectedItemData = {
  id: string;
  itemType: ItemType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
};

// Null = nothing selected
export type SelectedItem = SelectedItemData | null;

export const useSelectedItemCard = () => {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  // Select a card (pass the full item data, or null to clear)
  const selectItem = useCallback((item: SelectedItem) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return {
    selectedItem,
    selectItem,
    clearSelection,
  };
};

