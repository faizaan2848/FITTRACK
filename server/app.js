// Builds and configures the Express app (middleware, routes, error handling)
// but does not start listening. Kept separate from server.js so the app
// can be imported directly in tests without binding a port.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import bodyMeasurementRoutes from "./routes/bodyMeasurementRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import nutritionAiRoutes from "./routes/nutritionAiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";
// Phase 11+: import feature routers as they're built, e.g.
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// --- Global middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", phase: "1 - project setup" });
});

// --- Feature routes (mounted here as each phase is built) ---
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/body-measurements", bodyMeasurementRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/nutrition-ai", nutritionAiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/achievements", achievementRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/workouts", workoutRoutes);
// app.use("/api/exercises", exerciseRoutes);
// app.use("/api/meals", mealRoutes);
// app.use("/api/habits", habitRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
// app.use("/api/nutrition-ai", nutritionAiRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
