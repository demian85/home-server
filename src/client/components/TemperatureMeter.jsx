import React from 'react';

import styles from './TemperatureMeter.css';

export default function TemperatureMeter(props) {
  const perc = 100 - Math.round((props.value - 10) / props.value * 100);
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <span>{ props.value } ˚C</span>
      <div className={styles.range} style={{ backgroundImage: 'linear-gradient(to bottom, #ff0000 0%, #00ff00 50%, #0000ff 100%)' }}>
        <div className={styles.cover} style={{ height: `${perc}%`}} />
      </div>
    </div>
  );
}
