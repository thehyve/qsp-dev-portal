import React, { PureComponent } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import ApiCatalog from '../../components/ApiCatalog'
import { isAuthenticated } from '../../services/self'
import {
  loopkupCatalog,
  lookupSubscriptions,
  subscribe,
  unsubscribe
} from '../../services/api-catalog'
import QspBreadcrumb from '../../components/QspBreadcrumb'

export default class ApisPage extends PureComponent {
  state = {
    isAuthenticated: isAuthenticated(),
    catalog: null,
    subscriptions: null,
  };

  componentDidMount() {
    loopkupCatalog()
        .then(catalog => this.setState({ catalog }));

    if (this.state.isAuthenticated) {
      lookupSubscriptions()
          .then(subscriptions => this.setState({ subscriptions: subscriptions.map(s => s.id) }));
    }
  }

  handleSubscribe = (usagePlan) => subscribe(usagePlan.id)
      .then(() => this.setState({subscriptions: [...this.state.subscriptions, usagePlan.id]}));
  handleUnsubscribe = (usagePlan) => unsubscribe(usagePlan.id)
      .then(() => this.setState({subscriptions: this.state.subscriptions.filter(s => s !== usagePlan.id)}));

  render() {
    const {catalog, isAuthenticated, subscriptions} = this.state;
    return <div>
      <QspBreadcrumb {...this.props} />
      {catalog && (!isAuthenticated || subscriptions) ? (
          <ApiCatalog catalog={catalog} subscriptions={subscriptions} onSubscribe={this.handleSubscribe} onUnsubscribe={this.handleUnsubscribe}/>) : (
          <Dimmer active inverted>
            <Loader content='Loading' />
          </Dimmer>)}
    </div>;
  }
}
