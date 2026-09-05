import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CountUp from "../../components/common/CountUp";
import Reveal from "../../components/common/Reveal";
import styles from "./LandingPage.module.css";

const STATS = [
  { value: 12, decimals: 0, suffix: "K+", label: "Workouts Logged" },
  { value: 98, decimals: 0, suffix: "%", label: "Stick With It" },
  { value: 4.9, decimals: 1, suffix: "", label: "App Rating" },
];

const FEATURES = [
  {
    title: "Workout Tracker",
    text: "Build routines from a full exercise library, log sets and reps, and keep a complete history of every session.",
    icon: "🏋️",
  },
  {
    title: "Nutrition Logging",
    text: "Track meals across breakfast, lunch, dinner, and snacks with automatic daily macro and calorie totals.",
    icon: "🍽️",
  },
  {
    title: "Body Metrics",
    text: "Log weight and body fat over time, with BMI, BMR, and TDEE calculated automatically as you go.",
    icon: "📏",
  },
  {
    title: "Progress Analytics",
    text: "Weekly, monthly, and yearly charts across weight, calories, workouts, and completion rate.",
    icon: "📈",
  },
];

const STEPS = [
  {
    title: "Create your profile",
    text: "Set your stats and goal — lose fat, gain muscle, or maintain — and FitTrack tailors your targets.",
  },
  {
    title: "Log your day",
    text: "Track workouts, meals, water, and steps as you go, in seconds, from any device.",
  },
  {
    title: "Watch your progress",
    text: "See trends build week over week on a dashboard built to keep you moving forward.",
  },
];

function LandingPage() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brandGroup}>
          <div className={styles.brandMark}>F</div>
          <div className={styles.brand}>FITTRACK</div>
        </div>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.navLink}>
            Menu
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.eyebrow}>Train • Eat • Track</div>
        <h1 className={styles.heroTitle}>
          Build the body <br />
          <span className={styles.heroTitleGlow}>you keep promising</span>
        </h1>
        <p className={styles.heroSubtitle}>
          FitTrack keeps your workouts, meals, and health numbers in one calm, focused
          dashboard — so the only thing left to do is show up.
        </p>
        <div className={styles.heroActions}>
          <Link to="/register" className={styles.primaryCta}>
            Start Free
          </Link>
          <a href="#features" className={styles.secondaryCta}>
            See Features
          </a>
        </div>
      </section>

      <div className={styles.statStrip}>
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 100}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
              </div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <section className={styles.section} id="features">
        <h2 className={styles.sectionHeading}>Everything You Need</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureText}>{f.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>How It Works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>0{i + 1}</div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepText}>{step.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className={styles.ctaBanner}>
        <div className={styles.ctaBannerTitle}>Ready to Show Up?</div>
        <Link to="/register" className={styles.primaryCta}>
          Create Your Free Account
        </Link>
      </div>

      <footer className={styles.footer}>© {new Date().getFullYear()} FitTrack. All rights reserved.</footer>
    </div>
  );
}

export default LandingPage;
