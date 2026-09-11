import json
import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

load_dotenv()

API_KEY = os.environ.get("GOOGLE_API_KEY")
if not API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set. Add it to backend/.env")

genai.configure(api_key=API_KEY)

app = FastAPI(title="AI Nutritionist API")

# Allow the Vite dev server (and any origin in dev) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Env-overridable so future model bumps need no code change
# (e.g. GEMINI_MODEL=gemini-2.5-flash to roll back).
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

# Ask Gemini to reply in strict JSON so the frontend never has to parse
# free-form text. This is the main upgrade over the original script.
SYSTEM_PROMPT = """You are an expert nutritionist analyzing a photo of a meal.

Identify every distinct food item visible, estimate a reasonable serving
size for each, and estimate calories. Then produce an overall macro
breakdown and a short verdict on how healthy the meal is.

Respond with ONLY valid JSON, no markdown fences, matching exactly this
shape:

{
  "items": [
    {"name": string, "quantity": string, "calories": number}
  ],
  "total_calories": number,
  "macros": {
    "carbs_pct": number,
    "protein_pct": number,
    "fat_pct": number,
    "fiber_pct": number,
    "sugar_pct": number
  },
  "macro_grams": {
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "micronutrients": string,
  "is_healthy": boolean,
  "verdict": string,
  "notes": string
}

Percentages in "macros" should roughly sum to 100. "macro_grams" holds
estimated grams for the whole meal. "micronutrients" is 2-3 sentences
describing the notable vitamins and minerals this meal likely provides
(e.g. vitamin C, iron, calcium) and any it's notably low in. "verdict" is
one short sentence. "notes" can mention caveats (e.g. estimates depend on
portion size). If the image contains no food, set total_calories to 0 and
explain in "notes"."""

model = genai.GenerativeModel(
    model_name=MODEL_NAME,
    generation_config={"response_mime_type": "application/json"},
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze_meal(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    raw_bytes = await file.read()

    # Validate it's actually a readable image before spending an API call.
    try:
        Image.open(io.BytesIO(raw_bytes)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="That file doesn't look like a valid image.")

    image_part = {"mime_type": file.content_type, "data": raw_bytes}

    try:
        response = model.generate_content([SYSTEM_PROMPT, image_part])
        result = json.loads(response.text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Model returned an unexpected format. Try again.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini request failed: {e}")

    return result
