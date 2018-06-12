import React, { PureComponent } from 'react'
import Chart from 'chart.js'
import "react-datepicker/dist/react-datepicker.css";

let chartId = 0;

export default class ReactChart extends PureComponent {
  state = {
    chart: undefined,
    id: 'react-chart-' + (chartId++),
    previousChart: undefined,
  };

  componentDidMount() {
    this.handleUpdate();
  }

  componentDidUpdate() {
    this.handleUpdate();
  }

  handleUpdate() {
    if (this.props.chart === this.state.previousChart) {
      return;
    }

    if (this.state.chart) {
      this.state.chart.destroy()
    }

    if (this.props.chart) {
      const ctx = document.getElementById(this.state.id);
      let chart = new Chart(ctx, this.props.chart);
      this.setState({chart, previousChart: this.props.chart});
    } else {
      this.setState({chart: undefined, previousChart: this.props.chart});
    }
  }

  render() {
    return <canvas id={this.state.id} width='400' height='300'/>
  }
}
