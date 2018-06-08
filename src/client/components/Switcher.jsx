import React from 'react';

import styles from './Switcher.css';

export default function Switcher(props) {
  const checked = props.value === 'on';
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <span>{ props.value }</span>
      <div>
        <input
          type="checkbox"
          value="on"
          checked={checked}
          className={styles.switch}
          onChange={(e) => props.onChange(String(e.target.checked ? 1 : 0))}
          />
      </div>
    </div>
  );
}

