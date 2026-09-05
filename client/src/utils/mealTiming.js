// Maps a clock time to a meal slot. Used by the AI meal scanner to
// auto-file a scanned photo into the right section of the nutrition log
// based on when the photo was taken, without the user picking manually.

export function getMealTypeForTime(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "BREAKFAST";
  if (hour >= 11 && hour < 16) return "LUNCH";
  if (hour >= 16 && hour < 21) return "DINNER";
  return "SNACK";
}

export const MEAL_TYPE_LABELS = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};
