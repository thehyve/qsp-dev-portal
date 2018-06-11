import React, { PureComponent } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import ApiCatalog from '../../components/ApiCatalog'
import { isAuthenticated } from '../../services/self'
import { loopkupCatalog, lookupSubscriptions } from '../../services/api-catalog'
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

  render() {
    const {catalog, isAuthenticated, subscriptions} = this.state;
    return (<div>
      <QspBreadcrumb {...this.props} />
      {catalog && (!isAuthenticated || subscriptions) ? <ApiCatalog catalog={catalog} subscriptions={subscriptions}/> : (<Dimmer active inverted>
        <Loader content='Loading' />
      </Dimmer>)}
    </div>)
  }
}
