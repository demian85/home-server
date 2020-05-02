import React from 'react';

import StoreProvider from '../lib/store';

import styles from './Log.css';

class Log extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        {this.context.logs
          .map((log) => `[${log.level}] ${log.message}`)
          .join('\n')}
      </div>
    );
  }
}

Log.contextType = StoreProvider;

export default Log;
