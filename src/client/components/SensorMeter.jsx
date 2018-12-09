import React from 'react';
import PropTypes from 'prop-types'

import TimeAgo from './TimeAgo';

import styles from './SensorMeter.css';

function SensorMeter(props) {
  const css = { backgroundImage: `url(${props.icon})` };
  const tree = (
    <>
    <div className={styles.value}>
      {props.value}
      { props.suffix && <span className={styles.suffix}>{props.suffix}</span> }
    </div>
    { props.lastUpdate && <TimeAgo date={props.lastUpdate} /> }
    </>
  );

  if (props.title) {
    return (
      <div className={`${styles.root} ${styles.withTitle}`}>
        <h3 style={css}>{props.title}</h3>
        {tree}
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles.noTitle}`} style={css}>
      {tree}
    </div>
  );
}

SensorMeter.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  value: PropTypes.node,
  suffix: PropTypes.string,
  lastUpdate: PropTypes.number,
};

export default React.memo(SensorMeter);
