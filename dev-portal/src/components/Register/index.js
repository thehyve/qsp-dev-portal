import React, { PureComponent } from 'react'
import {Button, Form, Label, Message, Modal} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { register } from '../../services/self'
import { validateEmail, validateNonEmpty, validatePassword, validateConfirmPassword, validateApiClient} from '../../services/validation'
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

  handleRegister = (event) => {
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
      const {usagePlanId, token} = this.props;
      if (usagePlanId && token) {
        return confirmMarketplaceSubscription(usagePlanId, token)
      }
      this.props.onChange({signedIn: true});
    })
    .catch((e) => this.setState({errorMessage: e.message, isSubmitting: false}))
  };

  updateValidity = (args) => {
    if (Object.values(args.validValues).every(v => v === true)) {
      args.errorMessage = '';
    }
    this.setState(args);
  };

  validateEmail = (event) => {
    const validValues = Object.assign({}, this.state.validValues)
    const {isValid , errorMessage , email} = validateEmail(event.target.value)
    validValues[event.target.name] = isValid
    this.updateValidity({validValues , errorMessage , email })
  };

  validateName = (event) => {
    const validValues = Object.assign({}, this.state.validValues)
    const {isValid , errorMessage , val } = validateNonEmpty(event.target.name , event.target.value)
    validValues[event.target.name] = isValid
    this.updateValidity({validValues , errorMessage , val });
  };

  validatePassword = (event) => {
    const validValues = Object.assign({}, this.state.validValues);
    const {isValid , errorMessage , password } = validatePassword(event.target.value)
    validValues[event.target.name] = isValid
    this.updateValidity({validValues, errorMessage, password})
  };

  validateConfirmPassword = (event) => {
    const validValues = Object.assign({}, this.state.validValues);
    const {isValid , errorMessage , confirmPassword} = validateConfirmPassword(this.state.password, event.target.value)
    validValues[event.target.name] = isValid
    this.updateValidity({validValues , errorMessage, confirmPassword})
  };

  validateApiClient = (event) => {
    const validValues = Object.assign({}, this.state.validValues);
    const {isValid , errorMessage , apiClientName} = validateApiClient(event.target.value)
    validValues[event.target.name] = isValid
    this.updateValidity({validValues , errorMessage, apiClientName})
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
          <Form onSubmit={this.handleRegister} error={!!this.state.errorMessage} loading={this.state.isSubmitting} noValidate>
            <Form.Input type='email' label='Email' name='email' error={this.isError('email')} onBlur={this.validateEmail} />
            <Form.Input label='Name' name='name' error={this.isError('name')}  onBlur={this.validateName} required />
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
