import React from 'react';

import styles from './Home.css';

export default function Home() {
  return (
    <section className={styles.root}>
      <h1>Hello Home!</h1>
      <a href="/config">Config</a>
    </section>
  );
}
