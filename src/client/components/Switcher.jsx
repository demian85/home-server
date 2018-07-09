import React from 'react';
import Checkbox from './Checkbox';

import styles from './Switcher.css';

export default function Switcher(props) {
  const isOn = props.value === 'on';
  const backgroundImage = `url(/images/${props.icon})`;
  return (
    <div className={styles.root} style={{ backgroundImage }}>
      <h3>{ props.title }</h3>
      <Checkbox
        label={String(props.value).toUpperCase()}
        value={isOn}
        onChange={(value) => props.onChange(value ? 1 : 0)}
      />
    </div>
  );
}

