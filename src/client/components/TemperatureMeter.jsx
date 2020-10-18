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
      normalRange={[0, 28]}
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(TemperatureMeter);
