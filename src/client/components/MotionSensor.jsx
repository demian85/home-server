import React from 'react';

import styles from './MotionSensor.css';

export default function MotionSensor(props) {
  const label = props.value ? String(props.value).toUpperCase() : '-';
  return (
    <div className={styles.root} style={{ borderColor: props.borderColor }}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{label}</span>
    </div>
  );
}
