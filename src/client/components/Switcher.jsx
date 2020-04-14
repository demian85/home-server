import React from 'react';
import Checkbox from './Checkbox';
import EnergyMeter from './EnergyMeter';

import styles from './Switcher.css';

function Switcher(props) {
  // eslint-disable-next-line
  const { device, title, value, icon, onChange } = props;

  const powerStatus = device ? device.power : value;
  const onlineStatus = device ? device.online : null;
  const ipAddress = device ? device.ipAddress : null;
  const isOn = powerStatus === 'on' || powerStatus === true || powerStatus === 1;
  const backgroundImage = `url(/images/${icon})`;
  const disabled = onlineStatus === false;

  return (
    <div className={styles.root} style={{ backgroundImage }}>
      {ipAddress && (
        <button className={styles.config} title="Config" onClick={() => window.open(`http://${ipAddress}`)} />
      )}
      {device.external && <img src="/images/ifttt.png" className={styles.external} />}
      {title && <h3>{title}</h3>}
      <Checkbox disabled={disabled} label="" value={isOn} onChange={(value) => onChange(value ? 1 : 0)} />
      {onlineStatus !== null && (
        <span
          title={`${onlineStatus ? 'online' : 'offline'}`}
          className={`${styles.onlineStatus} ${onlineStatus ? styles.online : styles.offline}`}
        />
      )}
      {device.sensor && device.sensor.energy && <EnergyMeter value={device.sensor.energy.power} />}
    </div>
  );
}

export default React.memo(Switcher);
