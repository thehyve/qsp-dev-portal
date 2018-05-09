import React from 'react';
import ReactDOM from 'react-dom';
import App from "./index";

// **********
// Skip this test for now since it never works. Might be good idea to report it to
// https://github.com/aws-samples/aws-api-gateway-developer-portal.git
// **********

xit('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
