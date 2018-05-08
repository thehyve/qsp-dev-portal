import React, { PureComponent } from 'react'
import {Button, Form, Label, Message, Modal} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { register } from '../../services/self'
import { confirmMarketplaceSubscription } from '../../services/api-catalog'
import Recaptcha from 'react-recaptcha'

const sitekey = '6LeVj1YUAAAAAIGyrxguyOM0sgeiqpwCGmeIT-hJ'

 export default class Register extends PureComponent {
  state = {
    isSubmitting: false,
    signedIn: false,
    errorMessage: '',
    email: '',
    isOpen: false,
    validValues: {},
    password: '',
    confirmPassword: '',
    isValidCaptcha: false
  };

  open = () => this.setState({ isSubmitting: false, errorMessage: '', validValues: {}, isOpen: true, password: '', confirmPassword: '', isValidCaptcha: false, email: ''});
  close = () => this.setState({ isOpen: false });
  handleRegister = (...args) => this._handleRegister(...args);

  _handleRegister(event) {
    event.preventDefault();
    this.setState({isSubmitting: true});

    const data = new FormData(event.target);
    register(data.get('email').trim(), data.get('password'), [
      {Name: "email", Value: data.get('email').trim()},
      {Name: "name", Value: data.get('name').trim()},
      {Name: "custom:organisation", Value: data.get('organisation').trim()},
      {Name: "custom:apiClient", Value: data.get('apiClient').trim()},
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

  validateEmail = (event) => {
    const email = event.target.value.trim();
    const atSymbolIndex = email.indexOf('@');
    const dotSymbolIndex = email.lastIndexOf('.');

    let { errorMessage } = this.state;
    const validValues = Object.assign({}, this.state.validValues);

    validValues['email'] = true;

    if (email.length < 5) {
      validValues['email'] = false;
      errorMessage =  'Email address invalid.';
    } else if (email.length > 255) {
      validValues['email'] = false;
      errorMessage =  'Email address too long.';
    } else if (atSymbolIndex === -1 || email.lastIndexOf('@') !== atSymbolIndex) {
      validValues['email'] = false;
      errorMessage = '@-symbol placement invalid.';
    } else if (dotSymbolIndex === -1 || atSymbolIndex > dotSymbolIndex) {
      validValues['email'] = false;
      errorMessage = 'Domain dot (.) placement invalid.';
    }

    this.updateValidity({ validValues, errorMessage, email})
  };

  updateValidity = (args) => {
    if (Object.values(args.validValues).every(v => v === true)) {
      args.errorMessage = '';
    }
    this.setState(args);
  };

  validateNonEmpty = (element) => {
    return event => {
      const val = event.target.value.trim();

      let { errorMessage } = this.state;
      const validValues = Object.assign({}, this.state.validValues);

      validValues[element] = true;

      if (val.length === 0) {
        validValues[element] = false;
        errorMessage = element + ' may not be empty';
      } else if (val.length > 254) {
        validValues[element] = false;
        errorMessage = element + ' is too long';
      }
      this.updateValidity({validValues, errorMessage});
    }
  };

  validatePassword = (event) => {
    const password = event.target.value;
    let {errorMessage, confirmPassword} = this.state;
    const validValues = Object.assign({}, this.state.validValues);

    validValues['password'] = true;

    if (password.length < 8) {
      validValues['password'] = false;
      errorMessage = 'Password must be longer than 8 characters.';
    } else {
      validValues['confirmPassword'] = password === confirmPassword;
    }
    this.updateValidity({validValues, errorMessage, password})
  };


  validateConfirmPassword = (event) => {
    const confirmPassword = event.target.value;
    let {password} = this.state;
    const validValues = Object.assign({}, this.state.validValues);
    validValues['confirmPassword'] = password === confirmPassword;
    this.updateValidity({validValues, confirmPassword})
  };

  validateApiClient = (event) => {
    const client = event.target.value;
    let {errorMessage} = this.state;
    const validValues = Object.assign({}, this.state.validValues);
    if (!/^[a-zA-Z_-]{0,254}$/.test(client)) {
      validValues['apiClient'] = false;
      errorMessage = 'API client should contain only alphanumeric characters or the symbols dash ' +
        ' or underscore.'
    } else {
      validValues['apiClient'] = true;
    }
    this.updateValidity({validValues, errorMessage})
  };

  isError = (element) => {
    return element in this.state.validValues && !this.state.validValues[element]
  };

  isSubmitDisabled = () => {
    const { email, name, password, confirmPassword } = this.state.validValues;
    return email !== true || name !== true || password !== true || confirmPassword !== true || this.state.isValidCaptcha !== true;
  };

  verifyCaptcha = () => {
    this.setState({isValidCaptcha: true})
  };

 render() {
    const { isOpen } = this.state;

    return this.state.signedIn ? <Redirect to='/apis' /> : (
      <Modal
        size='small'
        open={isOpen}
        onOpen={this.open}
        onClose={this.close}
        trigger={<Button positive>Register</Button>}
      >
        <Modal.Header>Register</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.handleRegister} error={!!this.state.errorMessage} loading={this.state.isSubmitting} novalidate>
            <Form.Input type='email' label='Email' name='email' error={this.isError('email')} onBlur={this.validateEmail} />
            <Form.Input label='Name' name='name' error={this.isError('name')}  onBlur={this.validateNonEmpty('name')} required />
            <Form.Input label='Organisation' name='organisation' error={this.isError('organisation')} />
            <Form.Input label='API client' name='apiClient' error={this.isError('apiClient')} onBlur={this.validateApiClient}>
              <input/>
              <Label basic>:{this.state.email ? this.state.email : 'me@example.com'}</Label>
            </Form.Input>
            <Form.Input type='password' label='Password' name='password' autoComplete='false' error={this.isError('password')} onBlur={this.validatePassword} />
            <Form.Input type='password' label='Confirm password' name='confirmPassword' autoComplete='false' error={this.isError('confirmPassword')} onChange={this.validateConfirmPassword}/>
            <Recaptcha
              sitekey={sitekey}
              verifyCallback={ this.verifyCaptcha } />
            <Message error content={this.state.errorMessage} />
            <Modal.Actions style={{textAlign: 'right'}}>
              <Button type='button' onClick={this.close}>Close</Button>
              <Button primary type='submit' disabled={this.isSubmitDisabled()}>Register</Button>
            </Modal.Actions>
          </Form>
        </Modal.Content>
      </Modal>)
    }
 }
