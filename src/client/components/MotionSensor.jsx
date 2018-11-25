import React from 'react';

import TimeAgo from './TimeAgo';

import styles from './MotionSensor.css';

export default React.memo(function MotionSensor(props) {
  const label = props.value ? String(props.value).toUpperCase() : '-';
  return (
    <div className={styles.root} style={{ borderColor: props.borderColor }}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{label}</span>
      <TimeAgo date={props.lastUpdate} />
    </div>
  );
});
