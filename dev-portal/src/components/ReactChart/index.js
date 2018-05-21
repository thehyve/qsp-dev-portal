import React, { PureComponent } from 'react'
import Chart from 'chart.js'
import "react-datepicker/dist/react-datepicker.css";

let chartId = 0;

export default class ReactChart extends PureComponent {
  state = {
    chart: undefined,
    id: '',
    previousChart: undefined,
  };

  constructor(props) {
    super(props);
    this.state.id = 'react-chart-' + (chartId++);
  }

  componentDidMount() {
    this.handleUpdate();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.handleUpdate();
  }

  handleUpdate() {
    if (this.state.chart) {
      this.state.chart.destroy()
    }

    if (this.props.chart && this.props.chart !== this.state.previousChart) {
      const ctx = document.getElementById(this.state.id);
      let chart = new Chart(ctx, this.props.chart);

      this.setState({chart, previousChart: this.props.chart});
    } else {
      this.setState({chart: undefined});
    }
  }

  render() {
    return <canvas id={this.state.id} width='400' height='300'/>
  }
}
