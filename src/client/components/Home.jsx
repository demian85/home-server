import React from 'react';
import TemperatureMeter from './TemperatureMeter';

import styles from './Home.css';

export default function Home(props) {
  return (
    <section className={styles.root}>
      <h1>Hello Home!</h1>
      <a href="/config">Config</a>
      <pre>
        { JSON.stringify(props.report, null, ' ') }
      </pre>
      {
        props.report &&
        <section className={styles.dashboard}>
          <TemperatureMeter title="Temperatura" value={props.report.temperature} />
        </section>
      }
    </section>
  );
}
