import React from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';

import SensorMeter from './SensorMeter';

export default function Sun(props) {
  const sunrise = DateTime.fromISO(props.data.sunrise).toLocaleString(DateTime.TIME_24_SIMPLE);
  const sunset = DateTime.fromISO(props.data.sunset).toLocaleString(DateTime.TIME_24_SIMPLE);

  return (
    <>
      <SensorMeter value={sunrise} icon="images/sunrise.svg" />
      <SensorMeter value={sunset} icon="images/sunset.svg" />
    </>
  );
}

Sun.propTypes = {
  sunrise: PropTypes.string,
  sunset: PropTypes.string,
};
