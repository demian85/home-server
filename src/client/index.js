import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';

function init() {
  ReactDOM.render(
    React.createElement(BrowserRouter, {}, React.createElement(App)),
    document.getElementById('root')
  );
}

document.addEventListener('DOMContentLoaded', init);
