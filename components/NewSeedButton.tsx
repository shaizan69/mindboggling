"use client";

import React from "react";
import styles from "./NewSeedButton.module.css";

interface NewSeedButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function NewSeedButton({ onClick, disabled, children }: NewSeedButtonProps) {
  return (
    <div className={styles.wrapper}>
      <button onClick={onClick} disabled={disabled} className={disabled ? styles.disabled : ""}>
        <span className={styles.buttonTop}>{children}</span>
      </button>
    </div>
  );
}

