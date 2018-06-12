import React, { PureComponent } from 'react'
import {Button, Form, Label, Message, Modal} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { register } from '../../services/self'
import { validateEmail, validateNonEmpty, validatePassword, validateConfirmPassword, validateApiClient} from '../../services/validation'
import { confirmMarketplaceSubscription } from '../../services/api-catalog'
import Recaptcha from 'react-recaptcha'

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
    isValidCaptcha: false,
    sitekey: '6LeVj1YUAAAAAIGyrxguyOM0sgeiqpwCGmeIT-hJ'
  };

  open = () => this.setState({ isSubmitting: false, errorMessage: '', validValues: {}, isOpen: true, password: '', confirmPassword: '', isValidCaptcha: false, email: ''});
  close = () => this.setState({ isOpen: false });

  handleRegister = (event) => {
    event.preventDefault();

    const data = new FormData(event.target);
    const validations = ['email', 'name', 'password', 'confirmPassword', 'organisation', 'apiClient']
        .map(name => ({...this.doValidation(name, data.get(name)), name}));

    const {errorMessage} = validations.find(s => !s.isValid);

    if (errorMessage) {
      const validValues = validations.reduce((obj, {name, isValid}) => {
        obj[name] = isValid;
        return obj;
      }, {});
      this.setState({errorMessage, validValues});
      return;
    }

    if (!this.state.isValidCaptcha) {
      this.setState({errorMessage: 'Please enter captcha.'});
      return;
    }

    this.setState({isSubmitting: true});

    register(data.get('email').trim(), data.get('password'), [
      {Name: 'email', Value: data.get('email').trim()},
      {Name: 'name', Value: data.get('name').trim()},
      {Name: 'custom:organisation', Value: data.get('organisation').trim()},
      {Name: 'custom:apiClient', Value: data.get('apiClient').trim()},
    ])
    .then(() => {
      this.setState({signedIn: true, isSubmitting: false, errorMessage: ''});
      const {usagePlanId, token} = this.props;
      if (usagePlanId && token) {
        return confirmMarketplaceSubscription(usagePlanId, token)
      }
      this.props.onChange({signedIn: true});
    })
    .catch((e) => this.setState({errorMessage: e.message, isSubmitting: false}))
  };


  doValidation = (name, value) => {
    switch(name) {
      case 'email':
        return validateEmail(value);
      case 'name':
        return validateNonEmpty(name, value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(this.state.password, value);
      case 'apiClient':
        return validateApiClient(value);
      default:
        // no validation
        return {isValid: true, errorMessage: ''}
    }
  };

  validate = (event) => {
    event.preventDefault();
    const {name:key, value} = event.target;
    this.setState({[key]: value});
    const validValues = {...this.state.validValues};
    let {isValid, errorMessage} = this.doValidation(key, value);
    const oldValidity = validValues[key];
    validValues[key] = isValid;

    // update error message if current value changes validation
    if (isValid === false || oldValidity === false) {
      this.setState({validValues, errorMessage});
    } else {
      this.setState({validValues});
    }
  };

  isError = (element) => {
    return this.state.validValues[element] === false;
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
          <Form onSubmit={this.handleRegister} error={!!this.state.errorMessage} loading={this.state.isSubmitting} noValidate>
            <Form.Input type='email' label='Email' name='email' error={this.isError('email')} onBlur={this.validate} required />
            <Form.Input label='Name' name='name' error={this.isError('name')}  onBlur={this.validate} required />
            <Form.Input label='Organisation' name='organisation' error={this.isError('organisation')} />
            <Form.Input label='API client' name='apiClient' error={this.isError('apiClient')} onBlur={this.validate}>
              <input/>
              <Label basic>:{this.state.email ? this.state.email : 'me@example.com'}</Label>
            </Form.Input>
            <Form.Input type='password' label='Password' name='password' autoComplete='false' error={this.isError('password')} onBlur={this.validate} required />
            <Form.Input type='password' label='Confirm password' name='confirmPassword' autoComplete='false' error={this.isError('confirmPassword')} onChange={this.validate} required />
            <Recaptcha
              sitekey={this.state.sitekey}
              verifyCallback={ this.verifyCaptcha } />
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
