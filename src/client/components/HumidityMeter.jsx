import React from 'react';

import SensorMeter from './SensorMeter';

function HumidityMeter(props) {
  return (
    <SensorMeter
      title={props.title}
      icon="/images/humidity.svg"
      value={props.value}
      suffix="%"
      normalRange={[0, 80]}
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(HumidityMeter);
