import React from 'react';

import styles from './HumidityMeter.css';

export default function HumidityMeter(props) {
  const cssClass = `${styles.root} ${styles[props.place]}`;
  const borderColor = props.place === 'bedroom' ? '#1a9cf3' : (props.place === 'lounge' ? '#bba220' : '#25a84a');
  return (
    <div className={cssClass} style={{ borderColor }}>
      <h3>{props.title}</h3>
      <span className={styles.value}>{props.value} %</span>
    </div>
  );
}
