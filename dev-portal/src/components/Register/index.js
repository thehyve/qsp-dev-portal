import React, { PureComponent } from 'react'
import { Button, Form, Message, Modal } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { register } from '../../services/self'
import { confirmMarketplaceSubscription } from '../../services/api-catalog'

 export default class Register extends PureComponent {
  state = {
    isSubmitting: false,
    signedIn: false,
    errorMessage: '',
    isOpen: false
  };

  open = () => this.setState({ isSubmitting: false, errorMessage: '', isOpen: true });
  close = () => this.setState({ isOpen: false });
  handleRegister = (...args) => this._handleRegister(...args);

  _handleRegister(event, serializedForm) {
    event.preventDefault();
    this.setState({isSubmitting: true});

    register(serializedForm.email, serializedForm.password, [
            {name: "name", "value": serializedForm.name},
            {name: "custom:organisation", value: serializedForm.organisation},
            {name: "custom:apiClient", value: serializedForm.apiClient},
        ])
    .then(() => {
        this.setState({signedIn: true, isSubmitting: false, errorMessage: ''});

        const { usagePlanId, token } = this.props;

        if (usagePlanId && token) {
   	       return confirmMarketplaceSubscription(usagePlanId, token)
        }
    })
    .catch((e) => this.setState({errorMessage: e.message, isSubmitting: false}))
  }

  render() {
    const { isOpen } = this.state

    return this.state.signedIn ? <Redirect to='/apis' /> : (
      <Modal
        size='small'
        open={isOpen}
        onOpen={this.open}
        onClose={this.close}
        trigger={<Button secondary fluid>Register</Button>}
      >
        <Modal.Header>Register</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleRegister} error={!!this.state.errorMessage} loading={this.state.isSubmitting}>
            <Form.Input label='Email' name='email' />
            <Form.Input label='Name' name='name' />
            <Form.Input label='Organisation' name='organisation' />
            <Form.Input label='API client' name='apiClient' />
            <Form.Input type='password' label='Password' name='password' autoComplete='false' />
            <Message error content={this.state.errorMessage} />
            <Modal.Actions style={{textAlign: 'right'}}>
              <Button type='button' onClick={this.close}>Close</Button>
              <Button primary type='submit'>Register</Button>
            </Modal.Actions>
          </Form>
        </Modal.Content>
      </Modal>)
    }
}
