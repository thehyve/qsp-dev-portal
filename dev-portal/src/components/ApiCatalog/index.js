import React, { PureComponent } from 'react'
import {Card, Dimmer, Loader} from 'semantic-ui-react'
import ApiCard from '../ApiCard'

export default class ApiCatalog extends PureComponent {
  state = {
    isUpdatingSubscription: false,
  };

  handleUpdate = (updateFunc) => (usagePlan) => {
    this.setState({isUpdatingSubscription: true});

    updateFunc(usagePlan)
        .then(() => this.setState({isUpdatingSubscription: false}))
        .catch(err => {
          console.log('Failed to update subscription; reloading', err);
          window.setTimeout(() => window.location.reload(), 10000);
        });
  };

  render() {
    const {catalog, subscriptions, onSubscribe, onUnsubscribe} = this.props;

    return !this.state.isUpdatingSubscription ? <Card.Group itemsPerRow={3} stackable doubling>
              {catalog.map(usagePlan => {
                const isSubscribed = subscriptions ? subscriptions.includes(usagePlan.id) : undefined;
                return usagePlan.apis.map(api =>
                    <ApiCard key={api.id} usagePlan={usagePlan} api={api}
                             isSubscribed={isSubscribed}
                             onSubscribe={this.handleUpdate(onSubscribe)}
                             onUnsubscribe={this.handleUpdate(onUnsubscribe)}/>)
              })}
            </Card.Group> :  (<Dimmer active inverted>
      <Loader content='Updating subscription' />
    </Dimmer>)
  }
}
