import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from './Checkbox';

import styles from './SmartBulbControl.css';

function SmartBulbControl(props) {
  const { device, title, value, icon, onChange } = props;

  const powerStatus = device ? device.power : value;
  const onlineStatus = device ? device.online : null;
  const isOn = powerStatus === 'on' || powerStatus === true || powerStatus == 1;
  const backgroundImage = `url(/images/${icon})`;
  const disabled = onlineStatus === false;

  const onSceneSelect = (value) => {
    props.onSceneChange(value);
  };

  return (
    <div className={styles.root} style={{ backgroundImage }}>
      {title && <h3>{title}</h3>}
      <Checkbox disabled={disabled} label="" value={isOn} onChange={(value) => onChange(value ? 1 : 0)} />
      {onlineStatus !== null && (
        <span
          title={`${onlineStatus ? 'online' : 'offline'}`}
          className={`${styles.onlineStatus} ${onlineStatus ? styles.online : styles.offline}`}
        />
      )}
      <select className={styles.sceneSelector} onChange={onSceneSelect}>
        <option value="">- Set Scene -</option>
        <option value="morning">Morning</option>
        <option value="night">Night</option>
        <option value="cool">Cool</option>
        <option value="neutral">Neutral</option>
        <option value="warm">Warm</option>
        <option value="chill">Chill</option>
      </select>
    </div>
  );
}

SmartBulbControl.propTypes = {
  device: PropTypes.object,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  value: PropTypes.node,
  onChange: PropTypes.func.isRequired,
  onSceneChange: PropTypes.func.isRequired,
};

export default React.memo(SmartBulbControl);
