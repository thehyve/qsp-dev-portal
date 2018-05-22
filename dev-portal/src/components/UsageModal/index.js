import React, {PureComponent} from 'react'
import {Button, Modal} from 'semantic-ui-react'
import UsageChart from "../UsageChart";
import './index.css'

export default class UsageModal extends PureComponent {
  state = {
    isOpen: false,
  };

  open = () => this.setState({isOpen: true});
  close = () => this.setState({isOpen: false});

  render() {
    const {isOpen} = this.state;

    return <Modal
        size='small'
        open={isOpen}
        onOpen={this.open}
        onClose={this.close}
        trigger={this.props.trigger}>
      <Modal.Header>Used and Remaining API Usage</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>API usage in the month prior to the selected date.</p>
        </Modal.Description>
        <UsageChart usagePlanId={this.props.usagePlanId}/>
      </Modal.Content>
      <Modal.Actions style={{textAlign: 'right'}}>
        <Button type='button' onClick={this.close}>Close</Button>
      </Modal.Actions>
    </Modal>
  }
}
