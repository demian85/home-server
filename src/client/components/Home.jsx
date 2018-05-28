import React from 'react';

import TemperatureMeter from './TemperatureMeter';
import HumidityMeter from './HumidityMeter';
import Switcher from './Switcher';

import styles from './Home.css';

export default function Home(props) {
  return (
    <section className={styles.root}>
      <h1>Hello Home!</h1>
      <a href="/config">Config</a>
      {
        props.report &&
        <section className={styles.dashboard}>
          <Switcher title="Lámpara de sal" value={props.status.lamp} />
          <Switcher title="Patio" value={props.status.patio} />
          <Switcher title="Estufa" value={props.status.heater} />
          <TemperatureMeter title="Temperatura" value={props.report.temperature} />
          <TemperatureMeter title="Sensación térmica" value={props.report.realFeel} />
          <HumidityMeter title="Humedad" value={props.report.humidity} />
        </section>
      }
      <pre>
        { JSON.stringify(props.report, null, '  ') }
      </pre>
      <pre>
        { JSON.stringify(props.config, null, '  ') }
      </pre>
    </section>
  );
}
