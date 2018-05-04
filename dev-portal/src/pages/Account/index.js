import React, {PureComponent} from 'react'
import {Form} from 'semantic-ui-react'
import {getAccountDetails, isAuthenticated, showApiKey} from "../../services/self";
import QspBreadcrumb from "../../components/QspBreadcrumb";

export default class AccountDetails extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: isAuthenticated(),
      isLoaded: false,
      userCredentials: {
        email: '',
        name: '',
        'custom:organisation': '',
        apiKey: ''
      }
    }
  }

  componentDidMount() {
    getAccountDetails().then((d) => {
      showApiKey().then((k) => {
        this.setState({
          apiKey : k ,
          userCredentials: d,
          isLoaded: true})
      })
    });
  }

  render() {
    return (
      <div>
        <QspBreadcrumb {...this.props} />
        <h2>Account Details</h2>
        <Form noValidate loading={!this.state.isLoaded}>
          <Form.Input label='API Key' name='apiKey' value={this.state.apiKey}  readOnly/>
          <Form.Input type='email' label='Email' name='email'  value={this.state.userCredentials.email} readOnly/>
          <Form.Input label='Name' name='name' value={this.state.userCredentials.name} readOnly/>
          <Form.Input
            label='Organisation' name='organisation'
            value={this.state.userCredentials['custom:organisation']} readOnly/>
          <Form.Input
            label='API Client' name='apiClient'
            value={this.state.userCredentials['custom:apiClient']} readOnly/>
        </Form>
      </div>)
  }
}


