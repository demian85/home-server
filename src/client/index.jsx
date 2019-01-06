import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

function init() {
  ReactDOM.render(<App />, document.getElementById('root'));
}

document.addEventListener('DOMContentLoaded', init);
