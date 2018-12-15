import React from 'react';

import { devices } from './devices';

export const store = {
  loaded: false,
  error: false,
  mqttClient: null,
  config: null,
  report: null,
  auth: null,
  devices,
  logs: [],
};

const StoreProvider = React.createContext(store);

export const { Provider, Consumer } = StoreProvider;

export default StoreProvider;

