import React, { PureComponent } from 'react'
import {Button, Form, Label, Message, Modal} from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { register } from '../../services/self'
import { validateEmail, validateNonEmpty, validatePassword, validateConfirmPassword, validateApiClient} from '../../services/validation'
import { confirmMarketplaceSubscription } from '../../services/api-catalog'
import Recaptcha from 'react-recaptcha'
import {toObject} from "../../services/util";

 export default class Register extends PureComponent {
  state = {
    isSubmitting: false,
    signedIn: false,
    errorMessage: '',
    errors: {},
    email: '',
    isOpen: false,
    password: '',
    isValidCaptcha: false,
    sitekey: '6LeVj1YUAAAAAIGyrxguyOM0sgeiqpwCGmeIT-hJ'
  };

  open = () => this.setState({isSubmitting: false, errorMessage: '', isOpen: true, password: '', isValidCaptcha: false});
  close = (event) => {
    // Ignore escapes: they interact badly with forms
    if (event.type === 'keydown' && event.keyCode === 27) return;
    this.setState({ isOpen: false });
  };

  handleRegister = (event) => {
    event.preventDefault();

    const errors = ['email', 'name', 'password', 'confirmPassword', 'organisation', 'apiClient']
        .map(name => ({...this.doValidation(name, this.state[name] || ''), name}))
        .filter(s => !s.isValid)
        .reduce(toObject(({name}) => name, ({errorMessage}) => errorMessage), {});

    if (!this.state.isValidCaptcha) {
      errors.captcha = 'Captcha is not completed';
    }

    if (errors) {
      this.setState({errors});
      return;
    }

    this.setState({errors: {}, errorMessage: '', isSubmitting: true});

    const {email, name, organisation, apiClient, password} = this.state;
    const cognitoValues = {
      email, name,
      'custom:organisation': organisation,
      'custom:apiClient': apiClient,
    };
    register(email.trim(), password, cognitoValues)
        .then(() => {
          this.setState({signedIn: true, isSubmitting: false});
          const {usagePlanId, token} = this.props;
          if (usagePlanId && token) {
            return confirmMarketplaceSubscription(usagePlanId, token)
          }
          this.props.onChange({signedIn: true});
        })
        .catch(e => this.setState({errorMessage: e.message, isSubmitting: false}))
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
    let {isValid, errorMessage} = this.doValidation(key, value);

    // valid and error message does not need to change
    if (isValid && !this.state.errors.hasOwnProperty(key)) {
      return;
    }

    const errors = {...this.state.errors};
    if (isValid) {
      delete errors[key];
    } else {
      errors[key] = errorMessage;
    }
    this.setState({errors});
  };

  isError = (element) => this.state.errors.hasOwnProperty(element);

  formHasError = () => this.state.errorMessage.length > 0 || Object.getOwnPropertyNames(this.state.errors).length > 0;

  verifyCaptcha = () => {
    const errors = {...this.state.errors};
    delete errors.captcha;
    this.setState({isValidCaptcha: true, errors})
  };

 render() {
    const { isOpen, errors, errorMessage, isSubmitting, email, sitekey } = this.state;
    const errorList = Object.values(errors);

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
          <Form onSubmit={this.handleRegister} error={this.formHasError()} loading={isSubmitting} noValidate>
            <Form.Input type='email' label='Email' name='email' error={this.isError('email')} onBlur={this.validate} required />
            <Form.Input label='Name' name='name' error={this.isError('name')}  onBlur={this.validate} required />
            <Form.Input label='Organisation' name='organisation' error={this.isError('organisation')} />
            <Form.Input label='API client' name='apiClient' error={this.isError('apiClient')} onBlur={this.validate}>
              <input/>
              <Label basic>:{email ? email : 'me@example.com'}</Label>
            </Form.Input>
            <Form.Input type='password' label='Password' name='password' autoComplete='false' error={this.isError('password')} onBlur={this.validate} required />
            <Form.Input type='password' label='Confirm password' name='confirmPassword' autoComplete='false' error={this.isError('confirmPassword')} onFocus={this.validate} onChange={this.validate} required />
            <Recaptcha
              sitekey={sitekey}
              verifyCallback={ this.verifyCaptcha } />
            <Message error header={errorList.length ? 'There are some errors in your form' : undefined} content={errorMessage ? errorMessage : undefined} list={errorList.length ? errorList : undefined} />
            <Modal.Actions style={{textAlign: 'right'}}>
              <Button type='button' onClick={this.close}>Close</Button>
              <Button primary type='submit'>Register</Button>
            </Modal.Actions>
          </Form>
        </Modal.Content>
      </Modal>)
    }
 }
