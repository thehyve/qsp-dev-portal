import React, { PureComponent } from 'react'
import {Dimmer, Header, Input, Loader, Message} from 'semantic-ui-react'
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
  };

  componentDidMount() {
    this.loadChart();
  }

  handleDateChange = (date) => {
    this.setState({endDate: date}, this.loadChart);
  };

  loadChart = () => {
    this.setState({isLoading: true});
    fetchUsage(this.props.usagePlanId , this.state.endDate.toISOString(false))
        .then(({data}) => mapUsageByDate(data))
        .then(usageData => {
          this.setState({isLoading: false, errorMessage: '', infoMessage: ''});

          if (usageData.length === 0) {
            this.setState({chart: null})
          } else {
            this.setState({
              chart: {
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
          }
        })
        .catch((e) => this.setState({errorMessage: e, isLoading: false, chart: null}))
  };

  render() {
    return <div>
      <DatePicker customInput={<Input label='Chart end date' type='text'/>} selected={this.state.endDate} onChange={this.handleDateChange} maxDate={moment()} popperPlacement='bottom-end'/>
      <Message error content={this.state.errorMessage.toString()} hidden={!this.state.errorMessage}/>
      <Dimmer.Dimmable>
        <Dimmer active={this.state.isLoading || !this.state.chart} inverted>
          {this.state.isLoading ? <Loader content='Loading'/> : <Header>No usage data available</Header>}
        </Dimmer>
        <ReactChart chart={this.state.chart}/>
      </Dimmer.Dimmable>
    </div>
  }
}
