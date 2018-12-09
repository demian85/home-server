import React from 'react';

import SensorMeter from './SensorMeter';

function HumidityMeter(props) {
  return (
    <SensorMeter
      title={props.title}
      icon="/images/humidity.svg"
      value={props.value}
      suffix="%"
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(HumidityMeter);
