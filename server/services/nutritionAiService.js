import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// Forwards an uploaded meal photo to the Python nutrition AI service and
// returns its JSON response as-is. This is the only place in the whole
// app that knows the Python service exists - everything else (routes,
// controllers, the React client) just talks to Express normally.
export async function analyzeMealPhoto({ buffer, mimetype, originalname }) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: mimetype });
  formData.append("file", blob, originalname || "meal.jpg");

  let response;
  // Strip trailing slashes: a PYTHON_AI_SERVICE_URL like
  // "https://x.onrender.com/" would otherwise build "...com//api/analyze",
  // which FastAPI answers with 404 {"detail": "Not Found"}.
  const baseUrl = env.PYTHON_AI_SERVICE_URL.replace(/\/+$/, "");
  try {
    response = await fetch(`${baseUrl}/api/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    throw new ApiError(
      502,
      "Could not reach the nutrition AI service. Is the Python server running on port 8000?"
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.detail || "Nutrition AI service returned an error");
  }

  return data;
}
