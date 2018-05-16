import React from 'react';
import { Route } from 'react-router-dom';

import Home from './Home';
import Config from './Config';

export default function App() {
  return (
    <section>
      <Route exact path="/" component={Home} />
      <Route path="/config" component={Config} />
    </section>
  );
}
