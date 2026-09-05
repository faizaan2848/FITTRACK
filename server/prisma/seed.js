// Seeds the database with:
// - a shared exercise library (all categories from the brief)
// - marketplace products (all categories from the brief)
// - one demo user with a password you can actually log in with, plus
//   a few weeks of sample workout/meal/body-metric/habit data so the
//   Phase 4 dashboard has real numbers to render instead of empty states.
//
// Run with: npm run prisma:seed

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { placeholderImageUrl } from "../utils/placeholderImage.js";
import { EXERCISE_GUIDES } from "./exerciseGuides.js";

const prisma = new PrismaClient();

const EXERCISES = EXERCISE_GUIDES;

const PRODUCTS = [
  { name: "Whey Protein Isolate 2lb", description: "Fast-absorbing whey isolate with 25g protein per scoop, low in sugar and fat.", category: "PROTEIN", price: 3299, stock: 120, rating: 4.6 },
  { name: "Plant-Based Protein 2lb", description: "Vegan pea and rice protein blend with a full amino acid profile.", category: "PROTEIN", price: 2799, stock: 80, rating: 4.3 },
  { name: "Micronized Creatine Monohydrate 300g", description: "Pure micronized creatine for strength and muscle recovery, unflavored.", category: "CREATINE", price: 1499, stock: 200, rating: 4.8 },
  { name: "Mass Gainer 6lb", description: "High-calorie blend of protein and carbs for lean bulking.", category: "MASS_GAINER", price: 3699, stock: 60, rating: 4.2 },
  { name: "Pre-Workout Energy Blend", description: "Caffeine and beta-alanine formula for energy and focus before training.", category: "PRE_WORKOUT", price: 2499, stock: 150, rating: 4.5 },
  { name: "Stainless Steel Shaker Bottle", description: "Leak-proof 24oz shaker with built-in mixing mechanism.", category: "SHAKER", price: 999, stock: 300, rating: 4.4 },
  { name: "Insulated Gym Duffel Bag", description: "Spacious duffel with a separate insulated compartment for shakes and meals.", category: "GYM_BAG", price: 3999, stock: 45, rating: 4.7 },
  { name: "Resistance Band Set (5 levels)", description: "Latex resistance bands from light to heavy resistance, with carry bag.", category: "RESISTANCE_BAND", price: 1999, stock: 100, rating: 4.6 },
  { name: "Adjustable Dumbbell Pair 5-52lb", description: "Space-saving adjustable dumbbells, dial-select weight from 5 to 52lb per hand.", category: "DUMBBELL", price: 24999, stock: 20, rating: 4.9 },
  { name: "Olympic Barbell 7ft", description: "Standard 7ft Olympic barbell rated for 700lb, knurled grip.", category: "GYM_EQUIPMENT", price: 15999, stock: 30, rating: 4.7 },
  { name: "Foldable Weight Bench", description: "Adjustable incline/decline bench that folds flat for storage.", category: "GYM_EQUIPMENT", price: 10999, stock: 25, rating: 4.5 },
  { name: "Yoga Mat Pro", description: "Extra-thick non-slip mat for yoga, stretching, and floor exercises.", category: "GYM_EQUIPMENT", price: 2799, stock: 90, rating: 4.4 },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding exercises...");
  const exercises = [];
  for (const ex of EXERCISES) {
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } });
    const created = existing
      ? await prisma.exercise.update({ where: { id: existing.id }, data: ex })
      : await prisma.exercise.create({ data: ex });
    exercises.push(created);
  }

  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    // Idempotent: re-running the seed refreshes catalog rows instead of
    // duplicating them (matches only the seed catalog, never user listings).
    const existing = await prisma.product.findFirst({
      where: { name: p.name, createdByUserId: null },
    });
    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { ...p, imageUrl: placeholderImageUrl(p.name) },
      });
    } else {
      await prisma.product.create({ data: { ...p, imageUrl: placeholderImageUrl(p.name) } });
    }
  }

  console.log("Seeding demo user...");
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@fittrack.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@fittrack.app",
      passwordHash,
      age: 27,
      gender: "MALE",
      height: 178,
      weight: 76,
      goal: "GAIN_MUSCLE",
    },
  });

  // Idempotent: skip the 14-day sample data on re-runs (step/habit rows
  // have unique constraints per day and would crash with P2002).
  const alreadySeeded = await prisma.bodyMeasurement.findFirst({ where: { userId: user.id } });
  if (alreadySeeded) {
    console.log("Demo sample data already exists — skipping. Seed complete.");
    return;
  }

  console.log("Seeding 14 days of body measurements, meals, water, steps, habits...");
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);

    await prisma.bodyMeasurement.create({
      data: {
        userId: user.id,
        weight: 76 - i * 0.05,
        bodyFatPct: 18 - i * 0.05,
        recordedAt: date,
      },
    });

    await prisma.mealLog.createMany({
      data: [
        { userId: user.id, mealType: "BREAKFAST", name: "Oats & Whey", calories: 450, protein: 35, carbs: 55, fat: 8, fiber: 6, loggedAt: date },
        { userId: user.id, mealType: "LUNCH", name: "Chicken & Rice", calories: 650, protein: 50, carbs: 70, fat: 12, fiber: 4, loggedAt: date },
        { userId: user.id, mealType: "DINNER", name: "Salmon & Veggies", calories: 550, protein: 42, carbs: 30, fat: 22, fiber: 8, loggedAt: date },
      ],
    });

    await prisma.waterEntry.create({
      data: { userId: user.id, amountMl: 2000 + (i % 3) * 300, loggedAt: date },
    });

    await prisma.stepEntry.create({
      data: { userId: user.id, steps: 6000 + ((i * 733) % 5000), date },
    });

    for (const habitType of ["WORKOUT", "WATER", "SLEEP", "STRETCHING", "MEDITATION"]) {
      await prisma.habitEntry.create({
        data: { userId: user.id, habitType, date, completed: i % 3 !== 0 },
      });
    }
  }

  console.log("Seeding a workout template + workout logs...");
  const chestExercises = exercises.filter((e) => e && e.category === "CHEST");
  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      name: "Push Day",
      description: "Chest, shoulders, triceps",
      isTemplate: true,
      exercises: {
        create: chestExercises.slice(0, 2).map((ex, idx) => ({
          exerciseId: ex.id,
          sets: 4,
          reps: 10,
          weight: 60,
          restSeconds: 90,
          order: idx,
        })),
      },
    },
  });

  for (let i = 12; i >= 0; i -= 3) {
    await prisma.workoutLog.create({
      data: {
        userId: user.id,
        workoutId: workout.id,
        completedAt: daysAgo(i),
        durationMinutes: 55,
        caloriesBurned: 420,
      },
    });
  }

  console.log("Seed complete. Demo login: demo@fittrack.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
