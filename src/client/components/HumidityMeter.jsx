import React from 'react';

import styles from './HumidityMeter.css';

export default function HumidityMeter(props) {
  return (
    <div className={styles.root}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{props.value} %</span>
    </div>
  );
}
