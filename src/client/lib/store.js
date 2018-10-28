import React from 'react';

export const store = {
  loaded: false,
  mqttClient: null,
  config: null,
  report: null,
  auth: null,
  status: null,
  logs: [],
};

const StoreProvider = React.createContext(store);

export const { Provider, Consumer } = StoreProvider;
export default StoreProvider;

