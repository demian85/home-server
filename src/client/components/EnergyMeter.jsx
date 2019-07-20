import React from 'react';
import PropTypes from 'prop-types';

import styles from './EnergyMeter.css';

function EnergyMeter(props) {
  return (
    <span className={styles.root}>
      {props.value.Power} <span className={styles.suffix}>W</span>
    </span>
  );
}

EnergyMeter.propTypes = {
  value: PropTypes.object,
};

export default React.memo(EnergyMeter);
