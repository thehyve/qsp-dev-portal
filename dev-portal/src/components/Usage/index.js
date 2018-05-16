import React, { PureComponent } from 'react'
import { Modal, Dropdown, Message, Button } from 'semantic-ui-react'
import Chart from 'chart.js'
import { fetchUsage, mapUsageByDate } from '../../services/api-catalog'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";



 export default class Usage extends PureComponent {
   state = {
     isLoading: false,
     errorMessage: '',
     isOpen: false,
     startDate: moment(),
     chart: undefined,
     infoMessage: ''
   };

   open = () => this.setState({ isLoading: false, errorMessage: '', infoMessage: '', isOpen: true , startDate: moment()});
   close = () => this.setState({ isOpen: false });
   handleChange = (date) => {
     this.setState({startDate: date}, this.loadUsageChart);
   };

   loadUsageChart() {
     this.setState({isLoading: true});
     fetchUsage(this.props.usagePlanId , this.state.startDate.toDate())
     .then((result) => {
       const usedData = mapUsageByDate(result.data, 'used');
       const remainingData = mapUsageByDate(result.data, 'remaining');
       const ctx = document.getElementById('api-usage-chart-container');

       if(this.state.chart) {
         this.state.chart.destroy()
       }
       let _chart = new Chart(ctx, {
         type: 'bar',
         data: {
           labels: usedData.map(d => d.date.toLocaleDateString()),
           datasets: [
             {
               label: 'Used',
               data: usedData.map(d => d.usage),
               backgroundColor: 'rgba(255, 99, 132, 0.2)',
               borderColor: 'rgba(255,99,132,1)',
               borderWidth: 1,
               type: 'line',
               yAxisID: 'A',
             },
             {
               label: 'Remaining',
               data: remainingData.map(d => d.usage),
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
       });
       this.setState({chart: _chart, isLoading: false, errorMessage: '', infoMessage: ''})

       if(usedData.length ===0) {
         this.setState({infoMessage: 'No usage data available at the moment.'})
       }
     })
     .catch((e) => this.setState({errorMessage: e, isLoading: false}))
   }


  loadUsage(event) {
    event.preventDefault();
    this.loadUsageChart();
  }

  render() {
    const { isOpen } = this.state;

    return <Modal
      size='small'
      open={isOpen}
      onOpen={this.open}
      onClose={this.close}
      trigger={<Dropdown.Item onClick={event => this.loadUsage(event)}>Show Usage</Dropdown.Item>} >
      <Modal.Header>Used and Remaining API Usage</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          You can view usage details for last 31 days from selected date.
        </Modal.Description>
      </Modal.Content>
      <Modal.Content>
        <Modal.Description>
          Select the latest date here
        </Modal.Description>
        <DatePicker selected={this.state.startDate} onChange={this.handleChange} maxDate={moment()}/>
        {this.state.errorMessage ? <Message error content={this.state.errorMessage.toString()} /> : ''}
        {this.state.infoMessage ? <Message info content={this.state.infoMessage.toString()} /> : ''}
        <canvas id='api-usage-chart-container' width='400' height='300'/>
      </Modal.Content>
      <Modal.Actions style={{textAlign: 'right'}}>
        <Button type='button' onClick={this.close}>Close</Button>
      </Modal.Actions>
    </Modal>
  }
}
