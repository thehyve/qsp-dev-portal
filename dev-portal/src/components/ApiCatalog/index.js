import React, { PureComponent } from 'react'
import { Card } from 'semantic-ui-react'
import ApiCard from '../ApiCard'
import {subscribe, unsubscribe} from "../../services/api-catalog";


export default class ApiCatalog extends PureComponent {
  handleSubscribe = (event, usagePlan) => this.updateSubscription(event, usagePlan.id, subscribe, 'Subscribing');
  handleUnsubscribe = (event, usagePlan) => this.updateSubscription(event, usagePlan.id, unsubscribe, 'Unsubscribing');

  updateSubscription = (event, usagePlanId, subscriptionFunc, message) => {
    event.preventDefault();
    this.setState({isLoading: true, message});

    console.log(usagePlanId);

    subscriptionFunc(usagePlanId)
        .catch(err => console.log('Failed to update subscription; reloading anyway', err))
        .then(() => window.setTimeout(() => window.location.reload(), 5000));
  };

  render() {
    const {catalog, subscriptions} = this.props;
    return (
        <Card.Group itemsPerRow={3} stackable doubling>
          {catalog.map(usagePlan => usagePlan.apis.map(api => <ApiCard key={api.id} usagePlan={usagePlan} api={api} isSubscribed={subscriptions && subscriptions.includes(usagePlan.id)} onSubscribe={} onUnsubscribe={}/>))}
        </Card.Group>
    );
  }
}





