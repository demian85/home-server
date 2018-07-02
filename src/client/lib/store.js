import React from 'react';

export const store = {
  loaded: false,
  mqttClient: null,
  config: null,
  report: null,
  auth: null,
  status: null,
};

export const { Provider, Consumer } = React.createContext(store);
