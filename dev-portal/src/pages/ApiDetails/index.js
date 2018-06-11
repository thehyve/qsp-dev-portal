import React, { PureComponent } from 'react'
import { Dimmer, Loader, Button, Segment} from 'semantic-ui-react'
import {
  subscribe,
  getApi,
  isSubscribed,
  unsubscribe,
} from '../../services/api-catalog'
import SwaggerUI from "../../components/SwaggerUI";
import QspBreadcrumb from '../../components/QspBreadcrumb'
import {getApiKey, isAuthenticated} from "../../services/self";

export default class ApiDetailsPage extends PureComponent {
  state = {
    api: null,
    apiKey: null,
    apiKeyProp: null,
    isSubscribed: undefined,
    usagePlanId: null,
    isUpdatingSubscription: false,
    isAuthenticated: isAuthenticated(),
  };

  componentDidMount() {
    getApi(this.props.match.params.apiId)
        .then(({usagePlanId, api}) => {
          const apiKeyProp = Object.keys(api.swagger.securityDefinitions)[0];
          this.setState({api, apiKeyProp, usagePlanId}, this.lookupSubscription);
        });

    if (this.state.isAuthenticated) {
      getApiKey()
          .then(key => this.setState({apiKey: key.value}));
    }
  }

  lookupSubscription = () => {
    if (this.state.usagePlanId && this.state.isAuthenticated) {
      isSubscribed(this.state.usagePlanId)
          .then(subscription => this.setState({isSubscribed: subscription}))
    }
  };

  handleSubscribe = (event) => this.updateSubscription(event, subscribe);
  handleUnsubscribe = (event) => this.updateSubscription(event, unsubscribe);

  updateSubscription = (event, subscriptionFunc) => {
    event.preventDefault();

    this.setState({isUpdatingSubscription: true}, () =>
        subscriptionFunc(this.state.usagePlanId)
            .then(() => this.setState({isSubscribed: !this.state.isSubscribed, isUpdatingSubscription: false}))
            .catch(err => {
              console.log(this.state);
              console.log('Failed to update subscription; reloading', err);
              window.setTimeout(() => window.location.reload(), 10000);
            }));
  };

  subscriptionButton() {
    const {isSubscribed} = this.state;
    if (isSubscribed === undefined) {
      return '';
    } else if (isSubscribed) {
      return <Button fluid onClick={this.handleUnsubscribe}>Unsubscribe</Button>
    } else {
      return <Button primary fluid onClick={this.handleSubscribe}>Subscribe</Button>
    }
  }

  render() {
    const {api, isUpdatingSubscription, apiKey, apiKeyProp, isSubscribed} = this.state;

    return api ? (<div>
      <QspBreadcrumb {...this.props} />

      <Segment padded>
        <Dimmer active={isUpdatingSubscription} inverted verticalAlign='top'>
          <Loader content='Updating subscription' style={{top: '3rem'}}/>
        </Dimmer>

        {this.subscriptionButton()}
        <section className="swagger-section" style={{overflow: 'auto'}}>
          <SwaggerUI spec={api.swagger} apiKey={apiKey} apiKeyProp={apiKeyProp} isSubscribed={isSubscribed}/>
        </section>
      </Segment>
    </div>) :
    (<Dimmer active inverted>
      <Loader content='Loading' style={{top: '6rem'}} />
    </Dimmer>)
  }
}
