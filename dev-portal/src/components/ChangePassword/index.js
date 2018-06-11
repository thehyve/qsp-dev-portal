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
import {
  validateConfirmPassword,
  validatePassword
} from "../../services/validation";
import  {changePassword} from '../../services/self'
export default class ChangePassword extends PureComponent {

  state = {
    isSubmitting: false,
    isAuthenticated: false,
    errorMessage: '',
    password: '',
    confirmPassword: '',
    validValues: {},
    isOpen: false,
    oldPassword: ''
  };

  open = () => this.setState({isSubmitting: false, errorMessage: '', isOpen: true});
  close = () => {
    this.setState({isOpen: false})
  };

  updateValidity = (args) => {
    if (Object.values(args.validValues).every(v => v === true)) {
      args.errorMessage = '';
    }
    this.setState(args);
  };


  getValidator = (event) => {
    const {name, value} = event.target;
    switch (name) {
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(this.state.password, value);
      default:
        // no validation
        return {isValid: true, errorMessage: ''}
    }
  };

  handleChangePassword = (event) => {
    event.preventDefault();
    const {oldPassword, password} = this.state;
    const input = {
      oldPassword,
      'newPassword': password
    };
    this.setState({isSubmitting: true})
    changePassword(input)
    .then(() => {this.setState({successMessage: 'Password has been changed successfully' , errorMessage: '', isSubmitting: false})})
    .catch((e) => {this.setState({successMessage: '', errorMessage: e.message , isSubmitting: false})});
  };

  validate = (event) => {
    event.preventDefault();
    const {name: key, value} = event.target;
    this.setState({[key]: value});
    const validValues = Object.assign({}, this.state.validValues);
    const {isValid, errorMessage, val} = this.getValidator(event);
    validValues[key] = isValid;
    this.updateValidity({validValues, errorMessage, val});
  };

  isError = (element) => {
    return element in this.state.validValues && !this.state.validValues[element]
  };


  render() {
    const {isOpen} = this.state;
    return (
        <Modal
            size='small'
            open={isOpen}
            onOpen={this.open}
            onClose={this.close}
            trigger={<Button type='button' >Change Password</Button>}
        >
          <Modal.Header>Change Password</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleChangePassword} error={!!this.state.errorMessage}
                  loading={this.state.isSubmitting} noValidate success>
              <Form.Input type='password' label='Old Password' name='oldPassword' autoComplete='off' onChange={this.validate}/>
              <Form.Input type='password' label='New Password' name='password' autoComplete='off'
                          error={this.isError('password')} onBlur={this.validate}/>
              <Form.Input type='password' label='Repeat New Password' name='confirmPassword' autoComplete='off'
                          error={this.isError('confirmPassword')} onBlur={this.validate}/>
              <Message error content={this.state.errorMessage}/>
              <Message success content={this.state.successMessage} hidden={!this.state.successMessage}/>
              <Modal.Actions style={{textAlign: 'right'}}>
                <Button type='button' onClick={this.close}>Close</Button>
                <Button primary type='submit'>Submit</Button>
              </Modal.Actions>
            </Form>
          </Modal.Content>
        </Modal>)
  }

}
