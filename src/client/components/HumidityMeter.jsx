import React from 'react';

import TimeAgo from './TimeAgo';

import styles from './HumidityMeter.css';

export default React.memo(function HumidityMeter(props) {
  return (
    <div className={styles.root}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{props.value} %</span>
      <TimeAgo date={props.lastUpdate} />
    </div>
  );
});
