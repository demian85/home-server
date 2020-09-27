import React from 'react';
import Temperature from './icons/Temperature';

import SensorMeter from './SensorMeter';

function TemperatureMeter(props) {
  return (
    <SensorMeter
      title={props.title}
      icon={<Temperature />}
      value={props.value}
      suffix="˚C"
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(TemperatureMeter);
