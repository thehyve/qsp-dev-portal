/**
 * Copyright (c) 2018 The Hyve B.V.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {PureComponent} from 'react'
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import {Segment} from 'semantic-ui-react'
import Home from '../../pages/Home'
import Account from '../../pages/Account'
import CaseStudies from '../../pages/CaseStudies'
import GettingStarted from '../../pages/GettingStarted'
import Dashboard from '../../pages/Dashboard'
import Apis from '../../pages/Apis'
import ApiDetails from '../../pages/ApiDetails'
import AlertPopup from '../../components/AlertPopup'
import {init, isAuthenticated} from '../../services/self'
import './App.css'
import Footer from "../Footer";
import QspHeader from "../QspHeader";

const NoMatch = () => <h2>Page not found</h2>;

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
   isAuthenticated() ? <Component {...props} />
      : <Redirect to={{
        pathname: '/',
        state: { from: props.location }
      }} />
  )} />
);

export default class App extends PureComponent {

  constructor(props) {
    super(props);
    init();

    // We are using an S3 redirect rule to prefix the url path with #!
    // This then converts it back to a URL path for React routing
    // NOTE: For local development, you will get a Page Not Found when refreshing the Swagger UI page when it has a #!
    const hashRoute = window.location.hash.substring(2);
    window.history.pushState({}, 'home page', hashRoute)
  }

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <section className="App-intro">
            <AlertPopup/>
            <QspHeader/>
            <Segment className='App-body' basic>
              <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/login" render={() => <Redirect to="/"/>}/>
                <PrivateRoute path="/account-details" component={Account}/>
                <Route path="/case-studies" component={CaseStudies}/>
                <Route path="/getting-started" component={GettingStarted}/>
                <Route path="/dashboard" component={Dashboard}/>
                <Route exact path="/apis" component={Apis}/>
                <Route path="/apis/:apiId" component={ApiDetails}/>
                <Route component={NoMatch}/>
              </Switch>
            </Segment>
          </section>
          <Footer/>
        </div>
      </BrowserRouter>
    )
  }
}
