import React from 'react';

export const sonoffDevices = [
  'heater', 'heater2', 'lamp', 'desk-lamp', 'patio', 'socket1'
];

export const store = {
  loaded: false,
  error: false,
  mqttClient: null,
  config: null,
  report: null,
  auth: null,
  powerStatus: {},
  onlineStatus: {},
  logs: [],
};

const StoreProvider = React.createContext(store);

export const { Provider, Consumer } = StoreProvider;

export default StoreProvider;

