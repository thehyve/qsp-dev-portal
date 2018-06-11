import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Image, Dropdown} from 'semantic-ui-react'
import { isAuthenticated } from '../../services/self'
import UsageModal from '../UsageModal'

export default class ApiCard extends PureComponent {
  state = {
    isAuthenticated: isAuthenticated()
  };

  handleUnsubscribe = (event) => {
    event.preventDefault();
    this.props.onUnsubscribe(this.props.usagePlan);
  };

  handleSubscribe = (event) => {
    event.preventDefault();
    this.props.onSubscribe(this.props.usagePlan);
  };

  render() {
    const {usagePlan, api, isSubscribed} = this.props;
    return <Card key={api.id} style={{textAlign: 'center'}}>
          <Link to={`apis/${api.id}`} style={{background: 'rgba(0, 0, 0, 0)', padding: '1em'}}>{ api.image ? <Image src={api.image} style={{margin: 'auto'}} /> : ''}</Link>
          <Card.Content>
            <Card.Header><Link to={`apis/${api.id}`}>{api.swagger.info.title}</Link></Card.Header>
            <Card.Meta>
              <span className='date'>Version {api.swagger.info.version}</span>
            </Card.Meta>
            <Card.Description>{api.summary ? api.summary : api.swagger.info.description}</Card.Description>
          </Card.Content>

          <Card.Content extra>
            <a href={api.extraDoc} target="_blank" rel="noopener noreferrer">
              <Button >PDF documentation</Button>
            </a>
          </Card.Content>

          { isSubscribed !== undefined ?
            (<Card.Content extra>
              { isSubscribed ?
                (<Dropdown text='Actions' button>
                  <Dropdown.Menu>
                    <UsageModal usagePlanId={usagePlan.id} trigger={<Dropdown.Item>Show Usage</Dropdown.Item>}/>
                    <Dropdown.Item onClick={this.handleUnsubscribe}>Unsubscribe</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>) :
                <Button primary onClick={this.handleSubscribe}>Subscribe</Button>}
            </Card.Content>) :
              ''}
        </Card>;
  }
}


