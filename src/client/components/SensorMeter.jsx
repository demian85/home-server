import React from 'react';
import PropTypes from 'prop-types';

import TimeAgo from './TimeAgo';

import styles from './SensorMeter.css';

function SensorMeter(props) {
  const treeCss = [styles.value];

  if (
    Array.isArray(props.normalRange) &&
    (props.value < props.normalRange[0] || props.value > props.normalRange[1])
  ) {
    treeCss.push(styles.notInRange);
  }

  const tree = (
    <>
      <div className={treeCss.join(' ')}>
        {props.value !== undefined && props.value !== null ? (
          <>
            {props.value}
            {props.suffix && (
              <span className={styles.suffix}>{props.suffix}</span>
            )}
          </>
        ) : (
          '--'
        )}
      </div>
      {props.lastUpdate && <TimeAgo date={props.lastUpdate} />}
    </>
  );

  if (props.title) {
    return (
      <div className={styles.root}>
        <h3>
          {props.icon} {props.title}
        </h3>
        {tree}
      </div>
    );
  }

  return <div className={`${styles.root} ${styles.noTitle}`}>{tree}</div>;
}

SensorMeter.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  value: PropTypes.node,
  suffix: PropTypes.string,
  lastUpdate: PropTypes.number,
  normalRange: PropTypes.arrayOf(PropTypes.number),
};

export default React.memo(SensorMeter);
