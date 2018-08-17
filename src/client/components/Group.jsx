import React from 'react';

import styles from './Group.css';

export default function Group(props) {
  const cssClass = `${styles.root} ${styles[props.place]}`;
  return (
    <div className={`${styles.root} ${cssClass}`}>
      {props.children}
    </div>
  );
}
