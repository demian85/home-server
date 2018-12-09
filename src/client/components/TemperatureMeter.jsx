import React from 'react';

import SensorMeter from './SensorMeter';

function TemperatureMeter(props) {
  return (
    <SensorMeter
      title={props.title}
      icon="/images/temperature.svg"
      value={props.value}
      suffix="˚C"
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(TemperatureMeter);
