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
import {isAuthenticated, logout, getApiKey} from "../../services/self"


export default class QspMenu extends PureComponent {
  state = {
    isAuthenticated: isAuthenticated(),
    apiKey: {}
  };

  handleLogout() {
    const _state = {isAuthenticated: false, apiKey: {}};
    logout();
    this.setState(_state);
    this.props.onChange(_state);
  }

  showApiKey() {
    getApiKey().then(apiKey => {
      this.setState({ apiKey })
    })
  }

  apiKeyHeader() {
    let header = 'API key';
    if (this.state.apiKey.name) {
      header += ' for ' + this.state.apiKey.name;
    }
    if (this.state.apiKey.id) {
      header += ' (id ' + this.state.apiKey.id + ')';
    }
    return header;
  }

  render() {
    return !this.state.isAuthenticated ? <Redirect to='/'/> : (
      <Menu className='QspMenu' secondary>
        <Menu.Item name='browse'>
          <Link to="/"><Image src={logo} wrapped/></Link>
        </Menu.Item>

        <Menu.Menu position='right'>
          <Menu.Item href='/apis'>
            API Directory
          </Menu.Item>
          {!this.state.isAuthenticated ? '' : (
            <Dropdown item text='My Account'>
              <Dropdown.Menu>
                <Dropdown.Item href='/account-details'>
                  Account
                </Dropdown.Item>
                <Popup
                  trigger={<Menu.Item onClick={() => this.showApiKey()}>Show API Key</Menu.Item>}
                  content={this.state.apiKey.value ? this.state.apiKey.value : 'Loading API Key...'}
                  size='large'
                  header={this.apiKeyHeader()}
                  on='click'
                  position='left center'
                  wide='very'
                  style={{width: '29rem'}}
                  basic={true}
                />
                <Dropdown.Item onClick={() => this.handleLogout()} as={Link} to='/'>
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
