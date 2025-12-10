"use client";

import React from "react";
import styles from "./ViewSwitch.module.css";

interface ViewSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ViewSwitch({ checked, onChange }: ViewSwitchProps) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          className={styles.toggle}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.slider} />
        <span className={styles.cardSide} />
      </label>
    </div>
  );
}

