import React from 'react';
import Checkbox from './Checkbox';

import styles from './Switcher.css';

export default function Switcher(props) {
  const isOn = props.value === 'on' || props.value === true || props.value == 1;
  const backgroundImage = `url(/images/${props.icon})`;
  const disabled = props.online === false;
  return (
    <div className={styles.root} style={{ backgroundImage }}>
      { props.title && <h3>{props.title}</h3> }
      <Checkbox
        disabled={disabled}
        label=""
        value={isOn}
        onChange={(value) => props.onChange(value ? 1 : 0)}
      />
      {
        props.online !== undefined
          && <span className={`${styles.onlineStatus} ${props.online ? styles.online : styles.offline}`} />
      }
    </div>
  );
}
