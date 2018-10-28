import React from 'react';

import StoreProvider from '../lib/store';

import styles from './Log.css';

class Log extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        {
          this.context.logs.map((log) => {
            const str = `[${log.level}] ${log.message}`;
            return str;
          }).join('\n')
        }
      </div>
    );
  }
}

Log.contextType = StoreProvider;

export default Log;
