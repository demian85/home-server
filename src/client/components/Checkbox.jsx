import React from 'react';

import styles from './Checkbox.css';

export default function Checkbox(props) {
  const checked = !!props.value;
  const width = `${props.width || 30}px`;
  const height = `${props.width || 30}px`;
  return (
    <div className={styles.checkbox}>
      <span className={styles.label}>{ props.label }</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={props.disabled}
        className={styles.switch}
        style={{ width, height }}
        onChange={(e) => props.onChange(e.target.checked)}
        />
    </div>
  );
}
