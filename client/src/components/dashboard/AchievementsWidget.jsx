import { useEffect, useState } from "react";
import { getAchievementsRequest } from "../../services/achievementService";
import styles from "./AchievementsWidget.module.css";

function AchievementsWidget() {
  const [achievements, setAchievements] = useState(null);

  useEffect(() => {
    getAchievementsRequest().then(setAchievements).catch(() => setAchievements([]));
  }, []);

  if (!achievements) return null;

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className={`${styles.card} fadeIn`}>
      <div className={styles.title}>
        Achievements
        <span className={styles.countBadge}>{unlockedCount}/{achievements.length} unlocked</span>
      </div>
      <div className={styles.grid}>
        {achievements.map((a) => (
          <div
            key={a.key}
            className={a.isUnlocked ? `${styles.badge} ${styles.badgeUnlocked}` : styles.badge}
            title={a.description}
          >
            <div className={a.isUnlocked ? `${styles.icon} ${styles.iconUnlocked}` : styles.icon}>
              {a.icon}
            </div>
            <div className={styles.badgeTitle}>{a.title}</div>
            <div className={styles.badgeProgress}>{a.progress}/{a.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementsWidget;
