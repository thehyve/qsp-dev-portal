import React, { PureComponent } from 'react'
import { Form } from 'semantic-ui-react'
import Head from '../../components/Head'

export default class AccountDetails extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      apiKey: ''
    };
  }

  render() {
    return (
      <div>
        <Head {...this.props} />
        <h2>Account Details</h2>
          <Form noValidate>
            <Form.Input type='email' label='Email' name='email' disabled/>
            <Form.Input label='Name' name='name' disabled/>
            <Form.Input label='Organisation' name='organisation' disabled/>
            <Form.Input label='API client' name='apiClient' disabled/>
          </Form>
      </div>);
  }
}


