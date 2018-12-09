import React from 'react';
import PropTypes from 'prop-types'

import TimeAgo from './TimeAgo';

import styles from './SensorMeter.css';

function SensorMeter(props) {
  const css = { backgroundImage: `url(${props.icon})` };

  if (props.title) {
    return (
      <div className={`${styles.root} ${styles.withTitle}`}>
        <h3 style={css}>{props.title}</h3>
        <span className={styles.value}>{props.value}</span>
        { props.lastUpdate && <TimeAgo date={props.lastUpdate} /> }
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles.noTitle}`} style={css}>
      <span className={styles.value}>{props.value}</span>
      { props.lastUpdate && <TimeAgo date={props.lastUpdate} /> }
    </div>
  );
}

SensorMeter.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  value: PropTypes.node,
  lastUpdate: PropTypes.number,
};

export default React.memo(SensorMeter);
