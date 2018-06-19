import React, {PureComponent} from 'react'
import {Button, Form, Modal, Message} from 'semantic-ui-react'
import {getAccountDetails, isAuthenticated, updateUserDetails} from "../../services/self";
import QspBreadcrumb from "../../components/QspBreadcrumb";
import {
  validateApiClient,
  validateNonEmpty,
} from "../../services/validation";
import ChangePassword from "../../components/ChangePassword";

export default class AccountDetails extends PureComponent {
  state = {
    isAuthenticated: isAuthenticated(),
    isLoaded: false,
    email: '',
    name: '',
    organisation: '',
    apiClient: '',
    errorMessage: '',
    successMessage: '',
    validValues: {},
  };

  handleChanges = (event ) => {
    event.preventDefault();
    const {name:key, value} = event.target;
    this.setState({[key]: value, successMessage: '', errorMessage: ''});
    const validValues = Object.assign({}, this.state.validValues);
    const {isValid, errorMessage, val} = this.getValidator(event);
    validValues[key] = isValid;
    this.updateValidity({validValues, errorMessage, val});
  };

  componentDidMount() {
    getAccountDetails()
        .then(this.syncAccountDetails);
  }

  syncAccountDetails = ({email, name, 'custom:organisation':organisation, 'custom:apiClient':apiClient}) => {
    this.setState({email, name, organisation, apiClient, isLoaded: true});
  };

  handleSubmit = () => {
    this.setState({isLoaded: false , successMessage: ''});
    const {name, organisation, apiClient} = this.state;
    let userDetails = {
      name,
      'custom:organisation': organisation,
      'custom:apiClient': apiClient,
    };
    updateUserDetails(userDetails)
        .then(this.syncAccountDetails)
        .then(() => this.setState({errorMessage: '' , successMessage: 'Account details updated successfully'}))
        .catch(e => this.setState({errorMessage: e.message, successMessage: '', isLoaded: true}));
  };

  getValidator = (event) => {
    const {name, value} = event.target;
    switch(name) {
      case 'name':
        return validateNonEmpty(name, value);
      case 'apiClient':
        return validateApiClient(value);
      default:
        // no validation
        return {isValid: true, errorMessage: ''}
    }
  };

  isError = (element) => {
    return element in this.state.validValues && !this.state.validValues[element]
  };

  updateValidity = (args) => {
    if (Object.values(args.validValues).every(v => v === true)) {
      args.errorMessage = '';
    }
    this.setState(args);
  };

  render() {
    const { name, email, organisation, apiClient } = this.state;
    return (
      <div>
        <QspBreadcrumb {...this.props} />
        <h2>Account Details</h2>
        <Form noValidate loading={!this.state.isLoaded} onSubmit={this.handleSubmit} error={!!this.state.errorMessage} success={!!this.state.successMessage}>
          <Message success content={this.state.successMessage}/>
          <Form.Input type='email' label='Email' name='email'  value={email} readOnly transparent/>
          <Form.Input label='Name' name='name' value={name} error={this.isError('name')} onChange={this.handleChanges}/>
          <Form.Input label='Organisation' name='organisation' value={organisation} onChange={this.handleChanges}/>
          <Form.Input label='API Client' name='apiClient' error={this.isError('apiClient')} value={apiClient} onChange={this.handleChanges} />
          <Message error content={this.state.errorMessage}/>
          <Modal.Actions style={{textAlign: 'center'}}>
            <ChangePassword/>
            <Button primary type='submit' >Save</Button>
          </Modal.Actions>
        </Form>
      </div>)
  }
}
