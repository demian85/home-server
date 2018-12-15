import React from 'react';
import Checkbox from './Checkbox';

import styles from './Switcher.css';

function Switcher(props) {
  // eslint-disable-next-line
  const { device, title, icon, onChange } = props;

  const powerStatus = device.power;
  const onlineStatus = device.online;
  const ipAddress = device.ipAddress;
  const isOn = powerStatus === 'on' || powerStatus === true || powerStatus == 1;
  const backgroundImage = `url(/images/${icon})`;
  const disabled = onlineStatus === false;

  return (
    <div className={styles.root} style={{ backgroundImage }}>
      {
        ipAddress && onlineStatus &&
          <button
            className={styles.config}
            title="Config"
            onClick={() => window.open(`http://${ipAddress}`)}
          />
      }
      { title && <h3>{title}</h3> }
      <Checkbox
        disabled={disabled}
        label=""
        value={isOn}
        onChange={(value) => onChange(value ? 1 : 0)}
      />
      {
        onlineStatus !== null &&
          <span
            title={`${onlineStatus ? 'online' : 'offline'}`}
            className={`${styles.onlineStatus} ${onlineStatus ? styles.online : styles.offline}`}
          />
      }
    </div>
  );
}

export default React.memo(Switcher);
