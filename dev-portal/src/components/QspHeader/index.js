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
import QspMenu from "../QspMenu";
import {Header, Segment, Button} from "semantic-ui-react";
import SignIn from "../SignIn";
import Register from "../Register";
import {isAuthenticated} from "../../services/self";
import {confirmMarketplaceSubscription} from "../../services/api-catalog";
import {getQueryString} from "../../services/misc";
import {Menu} from 'semantic-ui-react'
import {Image} from 'semantic-ui-react'
import logo from '../QspMenu/logo.png'

export default class QspHeader extends PureComponent {

  constructor(props) {

    super(props);

    this.state = {
      isAuthenticated: isAuthenticated(),
    };

    // TODO: Code below are legacy. To find out what does it mean in relation with AWS.
    // ********************************************************************************
    const {usagePlanId, token} = getQueryString();

    if (usagePlanId && token) {
      this.state = {isAuthenticated: isAuthenticated(), usagePlanId, token};
      if (this.state.isAuthenticated) {
        confirmMarketplaceSubscription(usagePlanId, token).then(() => {
          window.location.href = '/apis'
        })
      }
    }
    // ********************************************************************************
  }

  handleAuthChange(d) {
    this.setState({isAuthenticated: d.signedIn});
  }

  renderLogin() {
    return (
      <Segment textAlign='center' vertical className='App-segment'>
        <Menu className='QspMenu' secondary>
          <Menu.Item name='browse'>
            <Image src={logo} wrapped/>
          </Menu.Item>
        </Menu>
        <br/>
        <Header>
          Welcome to Developer Portal &nbsp;
          <h1>Information service for personalized nutrition and lifestyle advice</h1>
          <Button.Group>
            <SignIn usagePlanId={this.state.usagePlanId} token={this.state.token}
                    onChange={(d) => this.handleAuthChange(d)}/>
            <Button.Or/>
            <Register usagePlanId={this.state.usagePlanId} token={this.state.token}
                      onChange={(d) => this.handleAuthChange(d)}/>
          </Button.Group>
        </Header>
      </Segment>
    );
  }

  renderToolbar() {
    return <QspMenu onChange={(d) => this.handleAuthChange(d)}/>;
  }

  render() {
    return this.state.isAuthenticated ? this.renderToolbar() : this.renderLogin();
  }
}
