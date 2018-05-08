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
import {Link, Redirect} from 'react-router-dom'
import {Menu, Popup, Image, Dropdown} from 'semantic-ui-react'
import logo from './logo.png'
import './QspMenu.css'
import {isAuthenticated, logout, showApiKey} from "../../services/self"


export default class QspMenu extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {signedIn: isAuthenticated(), apiKey: ''};
  }

  handleLogout() {
    const _state = {signedIn: false, apiKey: ''};
    logout();
    this.setState(_state);
    this.props.onChange(_state);
  }

  showApiKey() {
    showApiKey().then(apiKey => {
      this.setState({ apiKey })
    })
  }

  render() {
    return !this.state.signedIn ? <Redirect to='/'/> : (
      <Menu className='QspMenu' secondary>
        <Menu.Item name='browse'>
          <Link to="/"><Image src={logo} wrapped/></Link>
        </Menu.Item>

        <Menu.Menu position='right'>
          <Menu.Item href='/apis'>
            API Directory
          </Menu.Item>
          {!this.state.signedIn ? '' : (
            <Dropdown item text='My Account'>
              <Dropdown.Menu>
                <Dropdown.Item href='/account-details'>
                  Account
                </Dropdown.Item>
                <Popup
                  trigger={<Menu.Item onClick={() => this.showApiKey()}>Show API Key</Menu.Item>}
                  content={this.state.apiKey ? this.state.apiKey.toString() : 'Loading API Key...'}
                  on='click'
                  position='left center'
                />
                <Dropdown.Item onClick={() => this.handleLogout()}>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Menu.Menu>
      </Menu>
    );
  }
}
