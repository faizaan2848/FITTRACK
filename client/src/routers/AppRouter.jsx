// Central route table for the whole app.
// Pages are added here as each phase builds them out.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import LandingPage from "../pages/landing/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import WorkoutsList from "../pages/workouts/WorkoutsList";
import CreateWorkout from "../pages/workouts/CreateWorkout";
import ExerciseLibrary from "../pages/workouts/ExerciseLibrary";
import WorkoutHistory from "../pages/workouts/WorkoutHistory";
import NutritionTracker from "../pages/nutrition/NutritionTracker";
import Calculators from "../pages/calculators/Calculators";
import Marketplace from "../pages/marketplace/Marketplace";
import AddProduct from "../pages/marketplace/AddProduct";
import ProductDetail from "../pages/marketplace/ProductDetail";
import Cart from "../pages/marketplace/Cart";
import Wishlist from "../pages/marketplace/Wishlist";
import MealScanner from "../pages/nutritionAi/MealScanner";
import Analytics from "../pages/analytics/Analytics";
import Membership from "../pages/membership/Membership";
import Profile from "../pages/profile/Profile";
import Sales from "../pages/marketplace/Sales";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes - share the sidebar layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<WorkoutsList />} />
            <Route path="/workouts/new" element={<CreateWorkout />} />
            <Route path="/workouts/history" element={<WorkoutHistory />} />
            <Route path="/exercises" element={<ExerciseLibrary />} />
            <Route path="/nutrition" element={<NutritionTracker />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/new" element={<AddProduct />} />
            <Route path="/marketplace/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/nutrition-ai" element={<MealScanner />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/marketplace/sales" element={<Sales />} />
          </Route>
        </Route>

        {/* Phase 6+: nutrition, calculators, marketplace, analytics, settings */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
