import React from 'react'
import QspBreadcrumb from '../../components/QspBreadcrumb'
import {Container} from "semantic-ui-react";
import {Link} from "react-router-dom";

export default (props) => (
  <Container>
    <QspBreadcrumb {...props} />
    <h2>Getting Started</h2>
    <ol style={{listStyle: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem'}}>
      <li>Register for an <Link to='/'>account</Link></li>
      <li>Sign in to your account and get the API Key for your account</li>
      <li>Subscribe to a service <Link to='/apis'>here</Link>. </li>
      <li>By clicking on the service, you can see the API documentations and try out the APIs using your API Key. </li>
      <li>Build your application. Use the x-api-key header to send the API key in your requests</li>
    </ol>
  </Container>)
