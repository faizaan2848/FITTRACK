// All calculators here are pure functions of their inputs - no network
// calls needed, since these are formulas, not data lookups. The
// Calculators page can optionally POST a result to /api/body-measurements
// if the user wants to save it to their history.

export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category;
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  else category = "Obese";

  const healthyRangeKg = [
    Number((18.5 * heightM * heightM).toFixed(1)),
    Number((24.9 * heightM * heightM).toFixed(1)),
  ];

  return { bmi: Number(bmi.toFixed(1)), category, healthyRangeKg };
}

// US Navy method. Height/waist/neck/hip all in cm.
export function calculateBodyFatNavy({ gender, heightCm, waistCm, neckCm, hipCm, weightKg }) {
  let bodyFatPct;

  if (gender === "FEMALE") {
    bodyFatPct =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
  } else {
    bodyFatPct =
      495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) -
      450;
  }

  bodyFatPct = Math.max(2, Math.min(60, bodyFatPct)); // clamp to a sane physiological range

  let category;
  if (gender === "FEMALE") {
    if (bodyFatPct < 21) category = "Athletic";
    else if (bodyFatPct < 25) category = "Fit";
    else if (bodyFatPct < 32) category = "Average";
    else category = "Above average";
  } else {
    if (bodyFatPct < 14) category = "Athletic";
    else if (bodyFatPct < 18) category = "Fit";
    else if (bodyFatPct < 25) category = "Average";
    else category = "Above average";
  }

  const result = { bodyFatPct: Number(bodyFatPct.toFixed(1)), category };

  if (weightKg) {
    const fatMassKg = (bodyFatPct / 100) * weightKg;
    result.fatMassKg = Number(fatMassKg.toFixed(1));
    result.leanMassKg = Number((weightKg - fatMassKg).toFixed(1));
  }

  return result;
}

// Mifflin-St Jeor equation.
export function calculateBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "FEMALE" ? base - 161 : base + 5);
}

export const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: { label: "Sedentary (little/no exercise)", value: 1.2 },
  LIGHT: { label: "Light exercise (1-3 days/week)", value: 1.375 },
  MODERATE: { label: "Moderate exercise (3-5 days/week)", value: 1.55 },
  ACTIVE: { label: "Active (6-7 days/week)", value: 1.725 },
  VERY_ACTIVE: { label: "Very active (athlete/physical job)", value: 1.9 },
};

export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.value ?? 1.2;
  return Math.round(bmr * multiplier);
}

export function calculateGoalCalories(tdee) {
  return {
    cut: Math.round(tdee - 500),
    maintain: tdee,
    bulk: Math.round(tdee + 300),
  };
}
