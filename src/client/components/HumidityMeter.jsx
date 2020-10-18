import React from 'react';
import Humidity from './icons/Humidity';

import SensorMeter from './SensorMeter';

function HumidityMeter(props) {
  return (
    <SensorMeter
      title={props.title}
      icon={<Humidity />}
      value={props.value}
      suffix="%"
      normalRange={[0, 80]}
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(HumidityMeter);
