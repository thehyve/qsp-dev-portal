import React, { PureComponent } from 'react'
import {Dimmer, Loader, Message} from 'semantic-ui-react'
import ReactChart from '../ReactChart';
import { fetchUsage, mapUsageByDate } from '../../services/api-catalog'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";

export default class UsageChart extends PureComponent {
  state = {
    isLoading: false,
    errorMessage: '',
    isOpen: false,
    endDate: moment(),
    chart: undefined,
    infoMessage: ''
  };

  componentDidMount() {
    this.loadChart();
  }

  handleDateChange = (date) => {
    this.setState({endDate: date}, this.loadChart);
  };

  loadChart = () => {
    this.setState({isLoading: true});
    fetchUsage(this.props.usagePlanId , this.state.endDate.toDate())
        .then((result) => {
          const usageData = mapUsageByDate(result.data);
          this.setState({
            isLoading: false, errorMessage: '', infoMessage: '', chart: {
              type: 'bar',
              data: {
                labels: usageData.map(d => d.date.toLocaleDateString()),
                datasets: [
                  {
                    label: 'Used',
                    data: usageData.map(d => d.used),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255,99,132,1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'A',
                  },
                  {
                    label: 'Remaining',
                    data: usageData.map(d => d.remaining),
                    type: 'bar',
                    yAxisID: 'B',
                  }
                ]
              },
              options: {
                scales: {
                  yAxes: [
                    {
                      id: 'A',
                      type: 'linear',
                      position: 'left',
                      ticks: {
                        beginAtZero: true
                      }
                    },
                    {
                      id: 'B',
                      type: 'linear',
                      position: 'right',
                      ticks: {
                        beginAtZero: true
                      }
                    }
                  ]
                }
              }
            }
          });

          if (usageData.length === 0) {
            this.setState({infoMessage: 'No usage data available at the moment.'})
          }
        })
        .catch((e) => this.setState({errorMessage: e, isLoading: false}))
  };

  loadUsage(event) {
    event.preventDefault();
    this.loadChart();
  }

  render() {
    return <div>
      <DatePicker selected={this.state.endDate} onChange={this.handleDateChange} maxDate={moment()}/>
      <Message error content={this.state.errorMessage.toString()} hidden={!this.state.errorMessage}/>
      <Message info content={this.state.infoMessage.toString()} hidden={!this.state.infoMessage}/>
      <Dimmer.Dimmable>
        <Dimmer active={this.state.isLoading} inverted>
          <Loader content='Loading'/>
        </Dimmer>
        <ReactChart chart={this.state.chart}/>
      </Dimmer.Dimmable>
    </div>
  }
}
