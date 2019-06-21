import React from 'react';
import Checkbox from './Checkbox';

import styles from './AutoSwitcher.css';

function AutoSwitcher(props) {
  // eslint-disable-next-line
  const { value, label, onChange } = props;

  const isOn = value === 'on' || value === true || value == 1;

  return (
    <div className={styles.root}>
      <Checkbox label="" value={isOn} onChange={(value) => onChange(value ? 1 : 0)} />
      <h3>
        Auto heating
        <br />
        <span className={styles.label}>{label}</span>
      </h3>
    </div>
  );
}

export default React.memo(AutoSwitcher);
