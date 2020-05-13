import React from 'react';

import styles from './Group.css';
import { Link } from 'react-router-dom';

export default function Group(props) {
  const cssClass = `${styles.root} ${styles[props.place]}`;
  return (
    <div className={`${styles.root} ${cssClass}`}>
      {props.room && (
        <Link
          className={styles.config}
          title="Config"
          to={`/room-config/${props.room}`}
        />
      )}
      {props.children}
    </div>
  );
}
