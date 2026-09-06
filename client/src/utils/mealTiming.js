// Maps a clock time to a meal slot. Used by the AI meal scanner to
// auto-file a scanned photo into the right section of the nutrition log
// based on when the photo was taken, without the user picking manually.
//
// Slots: breakfast 5:00–10:59, lunch 11:00–15:59, dinner 16:00–21:59.
// Anything outside those hours (late night / early morning) files as a snack.

export function getMealTypeForTime(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) return "BREAKFAST";
  if (hour >= 11 && hour < 16) return "LUNCH";
  if (hour >= 16 && hour < 22) return "DINNER";
  return "SNACK";
}

export const MEAL_TYPE_LABELS = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

export const MEAL_SLOT_HINT =
  "Auto slot: 5–11am Breakfast · 11am–4pm Lunch · 4–10pm Dinner · otherwise Snacks";
