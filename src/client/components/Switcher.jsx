import React from 'react';

import styles from './Switcher.css';

export default function Switcher(props) {
  const checked = props.value === 'on';
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <span>{ props.value } ˚C</span>
      <div>
        <input type="checkbox" value={props.value} checked={checked} />
      </div>
    </div>
  );
}
