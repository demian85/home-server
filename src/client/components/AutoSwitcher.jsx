import React from 'react';
import Checkbox from './Checkbox';

import styles from './AutoSwitcher.css';

export default function AutoSwitcher(props) {
  const isOn = props.switchValue === 'on';
  const backgroundImage = `url(/images/${props.icon})`;
  return (
    <div className={styles.root} style={{ backgroundImage }}>
      <h3>{ props.title }</h3>
      <div className={styles.main}>
        <div>
          <Checkbox
            label={String(props.switchValue).toUpperCase()}
            value={isOn}
            onChange={(value) => props.onChange(value)}
          />
        </div>
        <div>
          <Checkbox
            label="Auto"
            value={props.autoValue}
            onChange={(value) => props.onAutoChange(value)}
          />
        </div>
      </div>
    </div>
  );
}

