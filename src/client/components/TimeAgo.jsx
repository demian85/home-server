import React from 'react';
import { DateTime } from 'luxon';

import styles from './TimeAgo.css';

export default class TimeAgo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      timeDiffSecs: this.getDiff(),
    };
    this.timer = null;
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      const timeDiffSecs = this.getDiff();
      this.setState({ timeDiffSecs });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { timeDiffSecs } = this.state;
    const daySeconds = 3600 * 24;

    let friendlyTimeAgo = '';
    if (timeDiffSecs) {
      if (timeDiffSecs < 60) {
        friendlyTimeAgo = `${timeDiffSecs}s ago`;
      } else if (timeDiffSecs < 3600) {
        friendlyTimeAgo = `${Math.round(timeDiffSecs / 60)}m ago`;
      } else if (timeDiffSecs < daySeconds) {
        friendlyTimeAgo = `${Math.round(timeDiffSecs / 3600)}h ago`;
      } else {
        friendlyTimeAgo = `${Math.round(timeDiffSecs / daySeconds)}d ago`;
      }
    }

    const css = [styles.root];

    if (timeDiffSecs >= 900) {
      css.push(styles.old);
    }

    return <span className={css.join(' ')}>{friendlyTimeAgo}</span>;
  }

  getDiff() {
    return (
      this.props.date &&
      Math.abs(
        DateTime.fromMillis(this.props.date).diffNow().as('seconds')
      ).toFixed(0)
    );
  }
}
