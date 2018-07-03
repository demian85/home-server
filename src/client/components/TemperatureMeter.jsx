import React from 'react';
import * as Highcharts from 'highcharts';

require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);

import styles from './TemperatureMeter.css';

const gaugeOptions = {
  title: null,
  pane: {
    startAngle: -90,
    endAngle: 90,
    background: {
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
      innerRadius: '60%',
      outerRadius: '100%',
      shape: 'arc'
    }
  },
  tooltip: {
    enabled: false
  },
  yAxis: {
    stops: [
      [0.1, '#55BF3B'], // green
      [0.5, '#DDDF0D'], // yellow
      [0.9, '#DF5353'] // red
    ],
    lineWidth: 0,
    minorTickInterval: null,
    tickAmount: 2,
    title: {
      y: -70
    },
    labels: {
      y: 16
    }
  },
  plotOptions: {
    solidgauge: {
      dataLabels: {
        y: 5,
        borderWidth: 0
      }
    }
  }
};

export default class TemperatureMeter extends React.Component {
  constructor(props) {
    super(props);
    this.chart = React.createRef();
  }

  componentDidMount() {
    Highcharts.chart(Highcharts.merge(gaugeOptions, {
      chart: {
        renderTo: this.chart.current,
        type: 'solidgauge'
      },
      yAxis: {
        min: 0,
        max: 40,
        title: {
          text: this.props.title
        }
      },
      credits: {
        enabled: false
      },
      series: [{
        data: [this.props.value],
      }]
    }));
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.chart} ref={this.chart} />
      </div>
    );
  }

}
