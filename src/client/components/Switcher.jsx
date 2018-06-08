import React from 'react';
import Checkbox from './Checkbox';

import styles from './Switcher.css';

export default function Switcher(props) {
  const isOn = props.value === 'on';
  return (
    <div className={styles.root}>
      <h3>{ props.title }</h3>
      <Checkbox
        label={props.value.toUpperCase()}
        value={isOn}
        onChange={(value) => props.onChange(value ? 1 : 0)}
      />
    </div>
  );
}

