import React from 'react'
import QspBreadcrumb from '../../components/QspBreadcrumb'

export default (props) => (
  <div>
    <QspBreadcrumb {...props} />
    <h2>Getting Started</h2>
    <ol style={{listStyle: 'decimal', paddingLeft: '1.5rem', marginBottom: '1rem'}}>
      <li>Register for an <a href='/'>account</a></li>
      <li>Sign in to your account and get the API Key for your account</li>
      <li>Subscribe to a service <a href='/apis' target='_blank' rel="noopener noreferrer">here</a>. </li>
      <li>By clicking on the service, you can see the API documentations and try out the APIs using your API Key. </li>
      <li>Build your application. Use the x-api-key header to send the API key in your requests</li>
    </ol>
  </div>)
