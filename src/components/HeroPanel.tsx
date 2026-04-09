import React from "react";
import styles from "../WallCalendar.module.css";
import type { HeroImage } from "../WallCalendar";

interface Props {
  hero: HeroImage;
  monthLabel: string;
  yearLabel: number;
  onPrev: () => void;
  onNext: () => void;
  transitioning: boolean;
}

const HeroPanel: React.FC<Props> = ({ hero, monthLabel, yearLabel, onPrev, onNext, transitioning }) => {
  return (
    <div className={`${styles.heroPanel} ${transitioning ? styles.fadeOut : styles.fadeIn}`}>
      <div className={styles.heroImageWrap}>
        <img src={hero.src} alt={hero.alt ?? "Calendar hero"} className={styles.heroImage} loading="lazy" />
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.monthBadge}>
        <span className={styles.monthName}>{monthLabel}</span>
        <span className={styles.yearLabel}>{yearLabel}</span>
      </div>

      <div className={styles.heroNav}>
        <button className={styles.navBtn} onClick={onPrev} aria-label="Previous month" disabled={transitioning}>‹</button>
        <button className={styles.navBtn} onClick={onNext} aria-label="Next month" disabled={transitioning}>›</button>
      </div>
    </div>
  );
};

export default HeroPanel;
