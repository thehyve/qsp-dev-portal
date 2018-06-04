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

import React, { PureComponent } from 'react'
import { Breadcrumb } from 'semantic-ui-react'
import { Link} from 'react-router-dom'
import { isAuthenticated } from '../../services/self'
import { getApi } from '../../services/api-catalog'

export default class QspBreadcrumb extends PureComponent {
  constructor(props) {
    super(props);

    if (this.isApiDetailsRoute()) {
      getApi(props.match.params.apiId)
      .then(data => {
        this.setState({
          apiName: data.api.swagger.info.title
        })
      })
    }

    this.state = {
      isAuthenticated: isAuthenticated(),
    }
  }

  isHomeRoute() {
    return this.props.match.path === '/'
  }

  isGettingStartedRoute() {
    return this.props.match.path === '/getting-started'
  }

  isCaseStudiesRoute() {
    return this.props.match.path === '/case-studies'
  }

  isApisListRoute() {
    return this.props.match.path === '/apis'
  }

  isApiDetailsRoute() {
    return this.props.match.path === '/apis/:apiId'
  }

  isAccountDetails() {
    return this.props.match.path === '/account-details'
  }

  render() {
    return (<section style={{marginBottom: '1rem'}}>
      <Breadcrumb>
        { this.isHomeRoute() ? <Breadcrumb.Section active>Home</Breadcrumb.Section> : <Breadcrumb.Section><Link to="/">Home</Link></Breadcrumb.Section> }
        { this.isGettingStartedRoute() ? <Breadcrumb.Section active><Breadcrumb.Divider icon='right chevron' />Getting Started</Breadcrumb.Section> : ''}
        { this.isCaseStudiesRoute() ? <Breadcrumb.Section active><Breadcrumb.Divider icon='right chevron' />Case Studies</Breadcrumb.Section> : ''}
        { this.isApisListRoute() ? <Breadcrumb.Section active><Breadcrumb.Divider icon='right chevron' />APIs</Breadcrumb.Section> : ''}
        { this.isApiDetailsRoute() ? <Breadcrumb.Section><Breadcrumb.Section><Breadcrumb.Divider icon='right chevron' /><Link to="/apis">APIs</Link></Breadcrumb.Section><Breadcrumb.Section active><Breadcrumb.Divider icon='right chevron' />{ this.state.apiName }</Breadcrumb.Section></Breadcrumb.Section> : ''}
        { this.isAccountDetails() ? <Breadcrumb.Section active><Breadcrumb.Divider icon='right chevron' />Account</Breadcrumb.Section> : ''}
      </Breadcrumb>
    </section>)
  }
}
