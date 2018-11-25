import React from 'react';

import styles from './Wind.css';

export default React.memo(function Wind(props) {
  return (
    <div className={styles.root}>
      { props.title && <h3>{props.title}</h3> }
      <span className={styles.value}>{props.value} km/h</span>
    </div>
  );
});
