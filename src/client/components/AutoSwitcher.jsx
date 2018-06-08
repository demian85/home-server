import React from 'react';

import styles from './AutoSwitcher.css';

export default function AutoSwitcher(props) {
  const isOn = props.switchValue === 'on';
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <div className={styles.main}>
        <div>
          <Checkbox label={props.switchValue} value={isOn} onChange={(value) => props.onChange(value)} />
        </div>
        <div>
          <Checkbox label="Auto" value={props.autoValue} onChange={(value) => props.onAutoChange(value)} />
        </div>
      </div>
    </div>
  );
}

function Checkbox(props) {
  const checked = !!props.value;
  return (
    <div className={styles.checkbox}>
      <span className={styles.label}>{ props.label }</span>
      <input
        type="checkbox"
        checked={checked}
        className={styles.switch}
        onChange={(e) => props.onChange(e.target.checked)}
        />
    </div>
  );
}

