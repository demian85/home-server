import React from 'react';

import StoreProvider from '../lib/store';
import JSONPretty from 'react-json-pretty';

import styles from './Log.css';

class Log extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        {this.context.logs.map((log, key) => {
          const { level, message, ...meta } = log;
          return (
            <div key={key}>
              [{level}] {message}{' '}
              {Object.keys(meta).length > 0 ? (
                <JSONPretty data={meta}></JSONPretty>
              ) : undefined}
            </div>
          );
        })}
      </div>
    );
  }
}

Log.contextType = StoreProvider;

export default Log;
