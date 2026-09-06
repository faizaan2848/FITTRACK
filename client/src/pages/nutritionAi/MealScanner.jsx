import { useCallback, useRef, useState } from "react";
import { analyzeMealPhotoRequest } from "../../services/nutritionAiService";
import { addMealRequest } from "../../services/nutritionService";
import { getMealTypeForTime, MEAL_TYPE_LABELS, MEAL_SLOT_HINT } from "../../utils/mealTiming";
import { useMembership } from "../../context/MembershipContext";
import UpgradeGate from "../../components/common/UpgradeGate";
import MacroPlate from "../../components/nutritionAi/MacroPlate";
import styles from "./mealScanner.module.css";

function buildMealName(items) {
  if (!items || items.length === 0) return "Scanned meal";
  const names = items.map((i) => i.name);
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3} more`;
}

function MealScanner() {
  const { limits } = useMembership();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loggedMeal, setLoggedMeal] = useState(null); // { mealType, calories } | "error" | null
  const [slotOverride, setSlotOverride] = useState("AUTO"); // AUTO | BREAKFAST | LUNCH | DINNER | SNACK
  const inputRef = useRef(null);

  const handleFile = useCallback((selected) => {
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setStatus("idle");
    setError("");
    setPreviewUrl(URL.createObjectURL(selected));
  }, []);

  function onDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }

  async function analyze() {
    if (!file) return;
    setStatus("loading");
    setError("");
    setLoggedMeal(null);
    try {
      const data = await analyzeMealPhotoRequest(file);
      setResult(data);
      setStatus("done");

      // Auto-file this into today's nutrition log. By default the slot
      // comes from the time of day; the "Log as" picker lets the user
      // override it (e.g. late dinner scanned at 10:30pm). Saving is a
      // separate try/catch so a save failure never hides scan results.
      const mealType = slotOverride === "AUTO" ? getMealTypeForTime() : slotOverride;
      try {
        await addMealRequest({
          mealType,
          name: buildMealName(data.items),
          calories: data.total_calories,
          protein: data.macro_grams?.protein_g || 0,
          carbs: data.macro_grams?.carbs_g || 0,
          fat: data.macro_grams?.fat_g || 0,
          fiber: 0,
        });
        setLoggedMeal({ mealType, calories: Math.round(data.total_calories) });
      } catch {
        setLoggedMeal("error");
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setLoggedMeal(null);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!limits.aiScanner) {
    return <UpgradeGate featureName="AI Meal Scanner" requiredPlan="PRO" />;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>AI Meal Scanner</h1>
      <p className={styles.pageSubtitle}>
        Snap or upload a photo of your meal — the AI estimates calories, macros, and gives a
        quick verdict.
      </p>

      {!previewUrl && (
        <div
          className={styles.dropzone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <p className={styles.dropzoneTitle}>Drop a meal photo here</p>
          <p className={styles.dropzoneSub}>or click to browse — JPG or PNG</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {previewUrl && (
        <div className={styles.previewRow}>
          <img src={previewUrl} alt="Uploaded meal" className={styles.previewImg} />
          <div className={styles.previewActions}>
            <label className={styles.slotRow}>
              <span className={styles.slotLabel}>Log as</span>
              <select
                className={styles.slotSelect}
                value={slotOverride}
                onChange={(e) => setSlotOverride(e.target.value)}
                disabled={status === "loading"}
              >
                <option value="AUTO">Auto ({MEAL_TYPE_LABELS[getMealTypeForTime()]})</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
                <option value="SNACK">Snack</option>
              </select>
            </label>
            <button className={styles.primaryBtn} onClick={analyze} disabled={status === "loading"}>
              {status === "loading" ? "Reading the plate..." : "Analyze meal"}
            </button>
            <button className={styles.ghostBtn} onClick={reset} disabled={status === "loading"}>
              Choose a different photo
            </button>
          </div>
          <p className={styles.slotHint}>{MEAL_SLOT_HINT}</p>
        </div>
      )}

      {status === "error" && <p className={styles.errorMsg}>{error}</p>}

      {result && (
        <section className={styles.results}>
          {loggedMeal && loggedMeal !== "error" && (
            <div className={styles.loggedBanner}>
              ✅ Logged {loggedMeal.calories} kcal to today's{" "}
              <strong>{MEAL_TYPE_LABELS[loggedMeal.mealType]}</strong>. You can edit or remove it
              from the Nutrition tab.
            </div>
          )}
          {loggedMeal === "error" && (
            <div className={styles.loggedBannerError}>
              Scan complete, but we couldn't save it to your nutrition log automatically. You can
              add it manually from the Nutrition tab.
            </div>
          )}

          <div className={styles.resultsTop}>
            <div>
              <span className={styles.eyebrow}>Total</span>
              <p className={styles.totalCalories}>{Math.round(result.total_calories)} kcal</p>
              <p className={`${styles.verdict} ${result.is_healthy ? styles.verdictGood : styles.verdictWatch}`}>
                {result.is_healthy ? "Looks balanced" : "Worth a second look"} — {result.verdict}
              </p>
            </div>
            <MacroPlate macros={result.macros} />
          </div>

          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{Math.round(item.calories)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.macro_grams && (
            <div className={styles.macroGrams}>
              <div className={styles.macroStat}>
                <span className={styles.macroStatValue}>{Math.round(result.macro_grams.protein_g)}g</span>
                <span className={styles.macroStatLabel}>Protein</span>
              </div>
              <div className={styles.macroStat}>
                <span className={styles.macroStatValue}>{Math.round(result.macro_grams.carbs_g)}g</span>
                <span className={styles.macroStatLabel}>Carbs</span>
              </div>
              <div className={styles.macroStat}>
                <span className={styles.macroStatValue}>{Math.round(result.macro_grams.fat_g)}g</span>
                <span className={styles.macroStatLabel}>Fat</span>
              </div>
            </div>
          )}

          {result.micronutrients && (
            <div className={styles.microBlock}>
              <span className={styles.eyebrow}>Vitamins &amp; minerals</span>
              <p style={{ marginTop: 6 }}>{result.micronutrients}</p>
            </div>
          )}

          {result.notes && <p className={styles.notes}>{result.notes}</p>}
        </section>
      )}

      <p className={styles.footerNote}>Estimates only — actual nutrition varies with portion size and preparation.</p>
    </div>
  );
}

export default MealScanner;
