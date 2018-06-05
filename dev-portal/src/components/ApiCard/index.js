import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Image, Dropdown, Dimmer, Loader} from 'semantic-ui-react'
import {
  addSubscription,
  unsubscribe,
  isSubscribed, lookupSubscriptions,
} from '../../services/api-catalog'
import { isAuthenticated } from '../../services/self'
import UsageModal from '../UsageModal'

export default class ApiCard extends PureComponent {

  constructor(props) {
    super();
    this.state = {
      isSubscribed: false,
      isLoading: true,
      message: ''
    };
    lookupSubscriptions().then(() => {
      this.setState({isSubscribed: isSubscribed(this.props.usagePlan.id) ? true : false, isLoading: true})
    });
  }

  handleSubscribe = (event, usagePlan) => {
    event.preventDefault();

    this.setState({isLoading: true, message: 'Subscribing'});
    addSubscription(usagePlan.id)
    .then(() => {
      this.setState({isSubscribed: true})})
    .catch(err => {
      console.log('Failed to subscribe; reloading anyway', err);
    })
    .then(() => new Promise((resolve => {
      window.setTimeout(() => resolve(), 3000);
      this.setState({isLoading: false});
    })))
    .then(() => window.location.reload());
  };


  handleUnsubscribe = (event, usagePlan) => {
    event.preventDefault();

    this.setState({isLoading: true, message: 'Unsubscribing'});
    unsubscribe(usagePlan.id)
    .then((res) => {
      this.setState({isSubscribed: false})})
    .catch(err => {
      console.log('Failed to unsubscribe; reloading anyway', err);
    })
    .then(() => new Promise((resolve => {
      window.setTimeout(() => resolve(), 3000);
      this.setState({isLoading: false});
    })))
    .then(() => window.location.reload());
  };

  render() {
    const {usagePlan, api} = this.props;
    return  this.state.isLoading ? (
        <Card key={api.id} style={{textAlign: 'center'}}>
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

          { isAuthenticated() ?
            (<Card.Content extra>
              { this.state.isSubscribed ?
                (<Dropdown text='Actions' button>
                  <Dropdown.Menu>
                    <UsageModal usagePlanId={usagePlan.id} trigger={<Dropdown.Item>Show Usage</Dropdown.Item>}/>
                    <Dropdown.Item onClick={event => this.handleUnsubscribe(event, usagePlan)}>Unsubscribe</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>) :
                <Button onClick={event => this.handleSubscribe(event, usagePlan)}>Subscribe</Button>}
            </Card.Content>) :
              ''}
        </Card>) :
        (<Dimmer active inverted>
          <Loader content={this.state.message} />
        </Dimmer>);
  }

}


