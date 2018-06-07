import React, { PureComponent } from 'react'
import { Dimmer, Loader } from 'semantic-ui-react'
import ApiCatalog from '../../components/ApiCatalog'
import { isAuthenticated } from '../../services/self'
import { loopkupCatalog, lookupSubscriptions } from '../../services/api-catalog'
import QspBreadcrumb from '../../components/QspBreadcrumb'

export default class ApisPage extends PureComponent {
  state = {
    catalog: null,
    subscriptions: null,
  };

  componentDidMount() {
    loopkupCatalog()
        .then(catalog => this.setState({ catalog }));

    if (isAuthenticated()) {
      lookupSubscriptions()
          .then(subscriptions => this.setState({ subscriptions }));
    }
  }

  render() {
    return (<div>
      <QspBreadcrumb {...this.props} />
      {this.state.catalog && (!isAuthenticated() || this.state.subscriptions) ? <ApiCatalog catalog={this.state.catalog} /> : (<Dimmer active inverted>
        <Loader content='Loading' />
      </Dimmer>)}
    </div>)
  }
}
