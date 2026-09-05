import api from "./api";

// Sends the photo to OUR Express server, not to Python directly.
// Express is the only thing that knows the Python service exists.
export async function analyzeMealPhotoRequest(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/nutrition-ai/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
