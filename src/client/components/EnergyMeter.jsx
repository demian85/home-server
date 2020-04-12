import React from 'react';
import PropTypes from 'prop-types';

import styles from './EnergyMeter.css';

function EnergyMeter(props) {
  return (
    <span className={styles.root}>
      {props.value} <span className={styles.suffix}>W</span>
    </span>
  );
}

EnergyMeter.propTypes = {
  value: PropTypes.number,
};

export default React.memo(EnergyMeter);
