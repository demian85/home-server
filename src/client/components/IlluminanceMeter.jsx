import React from 'react';

import SensorMeter from './SensorMeter';

function IlluminanceMeter(props) {
  const { value } = props;
  const status = [
    [10, 'low'],
    [50, 'mid'],
    [100, 'high'],
  ];
  let title = '';
  status.forEach((val) => {
    if (value >= val[0]) {
      title = val[1];
    }
  });

  return (
    <SensorMeter
      title="Illuminance"
      icon="/images/exposure.svg"
      value={props.value}
      suffix={`lx (${title})`}
      lastUpdate={props.lastUpdate}
    />
  );
}

export default React.memo(IlluminanceMeter);
