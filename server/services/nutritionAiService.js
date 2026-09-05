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
  try {
    response = await fetch(`${env.PYTHON_AI_SERVICE_URL}/api/analyze`, {
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
