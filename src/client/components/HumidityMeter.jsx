import React from 'react';

import styles from './HumidityMeter.css';

export default function HumidityMeter(props) {
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <span>{ props.value } %</span>
      <div className={styles.range} style={{ backgroundImage: 'linear-gradient(to bottom, #ff0000 0%, #00ff00 50%, #0000ff 100%)' }}>
        <div className={styles.cover} style={{ height: `${100 - props.value}%`}} />
      </div>
    </div>
  );
}
