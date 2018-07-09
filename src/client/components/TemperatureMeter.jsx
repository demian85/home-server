import React from 'react';

import styles from './TemperatureMeter.css';

export default function TemperatureMeter(props) {
  const cssClass = `${styles.root} ${styles[props.place]}`;
  const borderColor = props.place === 'bedroom' ? '#1a9cf3' : (props.place === 'lounge' ? '#bba220' : '#25a84a');
  return (
    <div className={cssClass} style={{ borderColor }}>
      <h3>{props.title}</h3>
      <span className={styles.value}>{props.value} ˚C</span>
    </div>
  );
}
