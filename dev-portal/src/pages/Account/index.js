import React, {PureComponent} from 'react'
import {Button, Form, Modal, Message} from 'semantic-ui-react'
import {getAccountDetails, isAuthenticated, updateUserDetails} from "../../services/self";
import QspBreadcrumb from "../../components/QspBreadcrumb";

export default class AccountDetails extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: isAuthenticated(),
      isLoaded: false,
      email: '',
      name: '',
      organisation: '',
      apiClient: '',
      errorMessage: ''
    };
    this.handleChanges = (e) => this._handleChanges(e);
    this.handleSubmit = this._handleSubmit.bind(this);
  }

  _handleChanges(event ) {
    event.preventDefault();
    const {name:key, value} = event.target;
    this.setState({[key]: value})
  }

  componentDidMount() {
    getAccountDetails().then((d) => {
      const {email, name, 'custom:organisation':organisation , 'custom:apiClient':apiClient} = d;
      this.setState({
        isLoaded: true,
        email: email,
        name: name,
        organisation: organisation,
        apiClient: apiClient,
        errorMessage: ''
      })
    });
  }

  _handleSubmit() {
    this.setState({isLoaded: false,});
    updateUserDetails([
      {Name: 'name', Value: this.state.name.trim()},
      {Name: 'custom:organisation', Value: this.state.organisation},
      {Name: 'custom:apiClient', Value: this.state.apiClient},
      ])
    .then((d) => this.setState({isLoaded: true, errorMessage: ''}))
    .catch((e) => {
      this.setState({errorMessage: e.message, isLoaded: true})
    });
  }

  render() {
    const { name, email, organisation, apiClient } = this.state
    return (
      <div>
        <QspBreadcrumb {...this.props} />
        <h2>Account Details</h2>
        <Form noValidate loading={!this.state.isLoaded} onSubmit={this.handleSubmit} error={!!this.state.errorMessage}>
          <Form.Input type='email' label='Email' name='email'  value={email} readOnly/>
          <Form.Input label='Name' name='name' value={name} onChange={this.handleChanges}/>
          <Form.Input label='Organisation' name='organisation' value={organisation} onChange={this.handleChanges}/>
          <Form.Input label='API Client' name='apiClient' value={apiClient} onChange={this.handleChanges} />
          <Message error content={this.state.errorMessage}/>
          <Modal.Actions style={{textAlign: 'center'}}>
            <Button primary type='submit' >Save</Button>
          </Modal.Actions>
        </Form>
      </div>)
  }
}


