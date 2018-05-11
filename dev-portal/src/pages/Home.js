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
import {Link} from 'react-router-dom'
import {Container, Card} from 'semantic-ui-react'
import '../index.css'

export default class HomePage extends PureComponent {
  render() {
    return (
      <Container className='Home'>
        <Card.Group itemsPerRow={2} stackable style={{textAlign: 'center'}}>
          <Card>
            <Card.Content>
              <Card.Header><Link to='/apis'>APIs</Link></Card.Header>
              <Card.Description><Link to='/apis'>See what APIs we have on offer</Link>, including extensive
                documentation. Sign in to manage your subscriptions, see your current usage, get your API Key, and test
                against our live API.</Card.Description>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content>
              <Card.Header><Link to='/getting-started'>Getting Started</Link></Card.Header>
              <Card.Description>Ready to get started? This is the place that answers all your questions. We'll have you
                up and running in no time. <Link to='/getting-started'>Let's get started!</Link></Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Container>
    )
  }
}
