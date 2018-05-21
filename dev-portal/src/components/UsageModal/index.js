import React, { PureComponent } from 'react'
import { Button, Dropdown, Modal } from 'semantic-ui-react'
import UsageChart from "../UsageChart";

export default class UsageModal extends PureComponent {
   state = {
     isOpen: false,
   };

   open = () => this.setState({ isOpen: true });
   close = () => this.setState({ isOpen: false });

  render() {
    const { isOpen } = this.state;

    return <Modal
        size='small'
        open={isOpen}
        onOpen={this.open}
        onClose={this.close}
        trigger={<Dropdown.Item onClick={this.loadUsage}>Show Usage</Dropdown.Item>} >
      <Modal.Header>Used and Remaining API Usage</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>You can view usage details for last 31 days from selected date.</p>
        </Modal.Description>
        <UsageChart usagePlanId={this.props.usagePlanId}/>
      </Modal.Content>
      <Modal.Actions style={{textAlign: 'right'}}>
        <Button type='button' onClick={this.close}>Close</Button>
      </Modal.Actions>
    </Modal>
  }
}
