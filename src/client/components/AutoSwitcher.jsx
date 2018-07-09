import React from 'react';
import Checkbox from './Checkbox';

import styles from './AutoSwitcher.css';

export default function AutoSwitcher(props) {
  const isOn = props.switchValue === 'on';
  const backgroundImage = `url(/images/${props.icon})`;
  const borderColor = props.borderColor;
  return (
    <div className={styles.root} style={{ borderColor, backgroundImage }}>
      { props.title && <h3>{props.title}</h3> }
      <div className={styles.main}>
        <div>
          <Checkbox
            label={String(props.switchValue).toUpperCase()}
            value={isOn}
            width="26"
            onChange={(value) => props.onChange(value)}
          />
        </div>
        <div style={{ marginTop: '5px' }}>
          <Checkbox
            label="AUTO"
            value={props.autoValue}
            onChange={(value) => props.onAutoChange(value)}
          />
        </div>
      </div>
    </div>
  );
}

