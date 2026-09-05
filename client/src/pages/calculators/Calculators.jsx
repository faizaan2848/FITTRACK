import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  calculateBMI,
  calculateBodyFatNavy,
  calculateBMR,
  calculateTDEE,
  calculateGoalCalories,
  ACTIVITY_MULTIPLIERS,
} from "../../utils/calculators";
import { saveMeasurementRequest } from "../../services/bodyMeasurementService";
import styles from "./calculators.module.css";

const TABS = [
  { key: "bmi", label: "BMI" },
  { key: "bodyfat", label: "Body Fat" },
  { key: "calories", label: "BMR / TDEE" },
];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function BMICalculator({ defaults }) {
  const [weight, setWeight] = useState(defaults.weight || "");
  const [height, setHeight] = useState(defaults.height || "");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleCalculate(e) {
    e.preventDefault();
    const w = num(weight);
    const h = num(height);
    if (!w || !h) return;
    setResult(calculateBMI(w, h));
    setSaved(false);
  }

  async function handleSave() {
    await saveMeasurementRequest({ weight: num(weight) });
    setSaved(true);
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleCalculate}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Weight (kg)</label>
            <input className={styles.input} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Height (cm)</label>
            <input className={styles.input} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>
        <button className={styles.calcBtn} type="submit">Calculate BMI</button>
      </form>

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultGrid}>
            <div>
              <div className={styles.resultLabel}>BMI</div>
              <div className={styles.resultValue}>{result.bmi}</div>
            </div>
            <div>
              <div className={styles.resultLabel}>Category</div>
              <div className={styles.resultValue}>{result.category}</div>
            </div>
            <div>
              <div className={styles.resultLabel}>Healthy Range</div>
              <div className={styles.resultValue} style={{ fontSize: "1rem" }}>
                {result.healthyRangeKg[0]}–{result.healthyRangeKg[1]} kg
              </div>
            </div>
          </div>
          <button className={styles.saveBtn} onClick={handleSave}>Save weigh-in</button>
          {saved && <div className={styles.savedMsg}>Saved to your body measurements.</div>}
        </div>
      )}
    </div>
  );
}

function BodyFatCalculator({ defaults }) {
  const [gender, setGender] = useState(defaults.gender || "MALE");
  const [height, setHeight] = useState(defaults.height || "");
  const [weight, setWeight] = useState(defaults.weight || "");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  function handleCalculate(e) {
    e.preventDefault();
    setError(null);
    const h = num(height), w = num(weight), wa = num(waist), nk = num(neck), hp = num(hip);
    if (!h || !wa || !nk || (gender === "FEMALE" && !hp)) {
      setError("Please fill in all required fields for your gender.");
      return;
    }
    setResult(calculateBodyFatNavy({ gender, heightCm: h, waistCm: wa, neckCm: nk, hipCm: hp, weightKg: w }));
    setSaved(false);
  }

  async function handleSave() {
    await saveMeasurementRequest({
      weight: num(weight),
      bodyFatPct: result.bodyFatPct,
      waist: num(waist),
      neck: num(neck),
      hip: gender === "FEMALE" ? num(hip) : null,
    });
    setSaved(true);
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleCalculate}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Gender</label>
            <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Height (cm)</label>
            <input className={styles.input} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Weight (kg, optional)</label>
            <input className={styles.input} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Waist (cm)</label>
            <input className={styles.input} type="number" value={waist} onChange={(e) => setWaist(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Neck (cm)</label>
            <input className={styles.input} type="number" value={neck} onChange={(e) => setNeck(e.target.value)} />
          </div>
          {gender === "FEMALE" && (
            <div className={styles.field}>
              <label className={styles.label}>Hip (cm)</label>
              <input className={styles.input} type="number" value={hip} onChange={(e) => setHip(e.target.value)} />
            </div>
          )}
        </div>
        {error && <div className={styles.savedMsg} style={{ color: "#b91c1c" }}>{error}</div>}
        <button className={styles.calcBtn} type="submit">Calculate Body Fat</button>
      </form>

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultGrid}>
            <div>
              <div className={styles.resultLabel}>Body Fat %</div>
              <div className={styles.resultValue}>{result.bodyFatPct}%</div>
            </div>
            <div>
              <div className={styles.resultLabel}>Category</div>
              <div className={styles.resultValue} style={{ fontSize: "1rem" }}>{result.category}</div>
            </div>
            {result.leanMassKg != null && (
              <>
                <div>
                  <div className={styles.resultLabel}>Lean Mass</div>
                  <div className={styles.resultValue}>{result.leanMassKg} kg</div>
                </div>
                <div>
                  <div className={styles.resultLabel}>Fat Mass</div>
                  <div className={styles.resultValue}>{result.fatMassKg} kg</div>
                </div>
              </>
            )}
          </div>
          <button className={styles.saveBtn} onClick={handleSave}>Save to my measurements</button>
          {saved && <div className={styles.savedMsg}>Saved to your body measurements.</div>}
        </div>
      )}
    </div>
  );
}

function CalorieCalculator({ defaults }) {
  const [gender, setGender] = useState(defaults.gender || "MALE");
  const [weight, setWeight] = useState(defaults.weight || "");
  const [height, setHeight] = useState(defaults.height || "");
  const [age, setAge] = useState(defaults.age || "");
  const [activityLevel, setActivityLevel] = useState("MODERATE");
  const [result, setResult] = useState(null);

  function handleCalculate(e) {
    e.preventDefault();
    const w = num(weight), h = num(height), a = num(age);
    if (!w || !h || !a) return;

    const bmr = calculateBMR({ gender, weightKg: w, heightCm: h, age: a });
    const tdee = calculateTDEE(bmr, activityLevel);
    const goals = calculateGoalCalories(tdee);
    setResult({ bmr, tdee, goals });
  }

  return (
    <div className={styles.card}>
      <form onSubmit={handleCalculate}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Gender</label>
            <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Weight (kg)</label>
            <input className={styles.input} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Height (cm)</label>
            <input className={styles.input} type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Age</label>
            <input className={styles.input} type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className={styles.field} style={{ gridColumn: "span 2" }}>
            <label className={styles.label}>Activity Level</label>
            <select className={styles.select} value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button className={styles.calcBtn} type="submit">Calculate</button>
      </form>

      {result && (
        <div className={styles.resultBox}>
          <div className={styles.resultGrid}>
            <div>
              <div className={styles.resultLabel}>BMR</div>
              <div className={styles.resultValue}>{result.bmr}</div>
              <div className={styles.resultSub}>kcal/day at rest</div>
            </div>
            <div>
              <div className={styles.resultLabel}>TDEE</div>
              <div className={styles.resultValue}>{result.tdee}</div>
              <div className={styles.resultSub}>kcal/day maintenance</div>
            </div>
          </div>
          <div className={styles.resultGrid} style={{ marginTop: "var(--space-3)" }}>
            <div>
              <div className={styles.resultLabel}>Cut</div>
              <div className={styles.resultValue} style={{ fontSize: "1.125rem" }}>{result.goals.cut} kcal</div>
            </div>
            <div>
              <div className={styles.resultLabel}>Maintain</div>
              <div className={styles.resultValue} style={{ fontSize: "1.125rem" }}>{result.goals.maintain} kcal</div>
            </div>
            <div>
              <div className={styles.resultLabel}>Bulk</div>
              <div className={styles.resultValue} style={{ fontSize: "1.125rem" }}>{result.goals.bulk} kcal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Calculators() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bmi");

  const defaults = {
    weight: user?.weight || "",
    height: user?.height || "",
    gender: user?.gender || "MALE",
    age: user?.age || "",
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Calculators</h1>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={tab.key === activeTab ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "bmi" && <BMICalculator defaults={defaults} />}
      {activeTab === "bodyfat" && <BodyFatCalculator defaults={defaults} />}
      {activeTab === "calories" && <CalorieCalculator defaults={defaults} />}
    </div>
  );
}

export default Calculators;
