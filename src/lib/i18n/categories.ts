import type { Category } from "@/types";

const categoryKeyMap: Record<string, string> = {
  "1": "categories.food",
  "2": "categories.shopping",
  "3": "categories.health",
  "4": "categories.transport",
  "5": "categories.services",
  "6": "categories.housing",
  "7": "categories.entertainment",
  "8": "categories.other",
};

const knownCategoryIds = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);

export function getTranslatedCategoryName(
  categoryId: string,
  fallbackName: string,
  t: (key: string) => string
): string {
  if (knownCategoryIds.has(categoryId)) {
    return t(categoryKeyMap[categoryId] || "categories.other");
  }
  return fallbackName;
}

export const defaultCategories: Category[] = [
  { id: "1", name: "categories.food", icon: "restaurant" },
  { id: "2", name: "categories.shopping", icon: "shopping_bag" },
  { id: "3", name: "categories.health", icon: "local_hospital" },
  { id: "4", name: "categories.transport", icon: "directions_car" },
  { id: "5", name: "categories.services", icon: "receipt" },
  { id: "6", name: "categories.housing", icon: "home" },
  { id: "7", name: "categories.entertainment", icon: "movie" },
  { id: "8", name: "categories.other", icon: "more_horiz" },
];
