import React from 'react';

import styles from './TemperatureMeter.css';

export default function TemperatureMeter(props) {
  return (
    <div className={styles.root}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{props.value} ˚C</span>
    </div>
  );
}
