/**
 * Copyright (c) 2018 The Hyve B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {PureComponent} from 'react'
import {Button, Form, Message, Modal} from 'semantic-ui-react'
import {Redirect} from 'react-router-dom'
import {login} from '../../services/self'
import {confirmMarketplaceSubscription} from '../../services/api-catalog'

export default class SignIn extends PureComponent {
  state = {
    isSubmitting: false,
    isAuthenticated: false,
    errorMessage: '',
    isOpen: false
  };

  open = () => this.setState({isSubmitting: false, errorMessage: '', isOpen: true});
  close = () => this.setState({isOpen: false});
  handleLogin = (event) => this._handleLogin(event);

  _handleLogin(event) {
    event.preventDefault();
    this.setState({isSubmitting: true});
    const data = new FormData(event.target);

    login(data.get('email'), data.get('password'))
      .then(() => {
        this.setState({isAuthenticated: true, isSubmitting: false, errorMessage: ''});

        const {usagePlanId, token} = this.props;

        if (usagePlanId && token) {
          return confirmMarketplaceSubscription(usagePlanId, token)
        }

        this.props.onChange({isAuthenticated: true});
      })
      .catch((e) => this.setState({errorMessage: e.message, isSubmitting: false}))
  }

  render() {
    const {isOpen} = this.state;

    return this.state.isAuthenticated ? <Redirect to='/'/> : (
      <Modal
        size='small'
        open={isOpen}
        onOpen={this.open}
        onClose={this.close}
        trigger={<Button primary>Sign In</Button>}
      >
        <Modal.Header>Sign in</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleLogin} error={!!this.state.errorMessage}
                loading={this.state.isSubmitting}>
            <Form.Input type='email' label='Email' name='email'/>
            <Form.Input type='password' label='Password' name='password' autoComplete='false'/>
            <Message error content={this.state.errorMessage}/>
            <Modal.Actions style={{textAlign: 'right'}}>
              <Button type='button' onClick={this.close}>Close</Button>
              <Button primary type='submit'>Sign In</Button>
            </Modal.Actions>
          </Form>
        </Modal.Content>
      </Modal>)
  }
}
