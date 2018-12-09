import React from 'react';

import TimeAgo from './TimeAgo';

import styles from './SensorMeter.css';

export default React.memo(function SensorMeter(props) {
  const css = { backgroundImage: `url(${props.icon})` };
  return (
    <div className={styles.root}>
      { props.title && <h3 style={css}>{props.title}</h3> }
      <span className={styles.value}>{props.value}</span>
      <TimeAgo date={props.lastUpdate} />
    </div>
  );
});
