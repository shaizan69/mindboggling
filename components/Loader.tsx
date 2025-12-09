import React from 'react';
import styles from './Loader.module.css';

export const Loader = () => {
  return (
    <div className={styles.bar}>
      <div className={styles.ball} />
    </div>
  );
};

