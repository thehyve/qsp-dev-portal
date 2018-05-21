import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Image, Dropdown } from 'semantic-ui-react'
import { addSubscription, unsubscribe, isSubscribed } from '../../services/api-catalog'
import { isAuthenticated } from '../../services/self'
import UsageModal from '../UsageModal'

function handleSubscribe(event, usagePlan) {
  event.preventDefault();

  addSubscription(usagePlan.id)
      .then(() => window.location.reload());
}

function handleUnsubscribe(event, usagePlan) {
  event.preventDefault();

  unsubscribe(usagePlan.id)
      .then(() => window.location.reload());
}

const SubscribedApiActionsDropdown = ({usagePlan, api}) => (
  <Dropdown text='Actions' button>
    <Dropdown.Menu>
      <UsageModal usagePlanId={usagePlan.id} />
      <Dropdown.Item onClick={event => handleUnsubscribe(event, usagePlan)}>Unsubscribe</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>);


const ApiCard = ({usagePlan, api}) => (
<Card key={api.id} style={{textAlign: 'center'}}>
  <Link to={`apis/${api.id}`} style={{background: 'rgba(0, 0, 0, 0)', padding: '1em'}}>{ api.image ? <Image src={api.image} style={{margin: 'auto'}} /> : ''}</Link>
  <Card.Content>
    <Card.Header><Link to={`apis/${api.id}`}>{api.swagger.info.title}</Link></Card.Header>
    <Card.Meta>
      <span className='date'>Version {api.swagger.info.version}</span>
    </Card.Meta>
    <Card.Description>{api.swagger.info.description}</Card.Description>
</Card.Content>
<Card.Content extra>
  <a href={api.extraDoc} target="_blank" rel="noopener noreferrer">
    <Button >PDF documentation</Button>
  </a>
</Card.Content>

  { isAuthenticated() ? (<Card.Content extra>
    { isSubscribed(usagePlan.id) ? <SubscribedApiActionsDropdown api={api} usagePlan={usagePlan} /> : <Button onClick={event => handleSubscribe(event, usagePlan)}>Subscribe</Button>}
  </Card.Content>) : ''}
</Card>)

export default ({ catalog }) => (
  <Card.Group itemsPerRow={3} stackable doubling>
    {catalog.map(usagePlan => usagePlan.apis.map(api => ApiCard({usagePlan, api})))}
  </Card.Group>)
