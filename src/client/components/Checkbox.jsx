import React from 'react';

import styles from './Checkbox.css';

export default function Checkbox(props) {
  const checked = !!props.value;
  return (
    <div className={styles.checkbox}>
      <span className={styles.label}>{props.label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={props.disabled}
        className={styles.switch}
        onChange={(e) => props.onChange(e.target.checked)}
      />
    </div>
  );
}
