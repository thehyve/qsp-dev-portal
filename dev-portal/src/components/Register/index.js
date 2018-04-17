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
    isOpen: false,
    validValues: {},
    password: '',
    confirmPassword: '',
  };

  open = () => this.setState({ isSubmitting: false, errorMessage: '', validValues: {}, isOpen: true, password: '', confirmPassword: '' });
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
    const val = event.target.value.trim();
    const atSymbolIndex = val.indexOf('@');
    const dotSymbolIndex = val.lastIndexOf('.');

    let { errorMessage } = this.state;
    const validValues = Object.assign({}, this.state.validValues);

    validValues['email'] = true;

    if (val.length < 5) {
      validValues['email'] = false;
      errorMessage =  'Email address invalid.';
    } else if (val.length > 255) {
      validValues['email'] = false;
      errorMessage =  'Email address too long.';
    } else if (atSymbolIndex === -1 || val.lastIndexOf('@') !== atSymbolIndex) {
      validValues['email'] = false;
      errorMessage = '@-symbol placement invalid.';
    } else if (dotSymbolIndex === -1 || atSymbolIndex > dotSymbolIndex) {
      validValues['email'] = false;
      errorMessage = 'Domain dot (.) placement invalid.';
    }

    this.updateValidity({ validValues, errorMessage })
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

  isError = (element) => {
    return element in this.state.validValues && !this.state.validValues[element]
  };

  isSubmitDisabled = () => {
    const { email, name, password, confirmPassword } = this.state.validValues;
    return email !== true || name !== true || password !== true || confirmPassword !== true;
  };

 render() {
    const { isOpen } = this.state;

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
          <Form onSubmit={this.handleRegister} error={!!this.state.errorMessage} loading={this.state.isSubmitting} novalidate>
            <Form.Input type='email' label='Email' name='email' error={this.isError('email')} onBlur={this.validateEmail} />
            <Form.Input label='Name' name='name' error={this.isError('name')}  onBlur={this.validateNonEmpty('name')} required />
            <Form.Input label='Organisation' name='organisation' error={this.isError('organisation')} />
            <Form.Input label='API client' name='apiClient' error={this.isError('apiClient')} />
            <Form.Input type='password' label='Password' name='password' autoComplete='false' error={this.isError('password')} onBlur={this.validatePassword} />
            <Form.Input type='password' label='Confirm password' name='confirmPassword' autoComplete='false' error={this.isError('confirmPassword')} onChange={this.validateConfirmPassword}/>
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
