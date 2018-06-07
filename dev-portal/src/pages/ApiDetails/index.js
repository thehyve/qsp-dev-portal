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
    isSubscribed: null,
    usagePlanId: null,
    isUpdatingSubscription: false
  };

  componentDidMount() {
    getApi(this.props.match.params.apiId)
        .then(({usagePlanId, api}) => {
          const apiKeyProp = Object.keys(api.swagger.securityDefinitions)[0];
          this.setState({api, apiKeyProp, usagePlanId}, this.lookupSubscription);
        });

    if (isAuthenticated()) {
      getApiKey()
          .then(key => this.setState({apiKey: key.value}));
    }
  }

  lookupSubscription = () => {
    if (this.state.usagePlanId) {
      isSubscribed(this.state.usagePlanId)
          .then(subscription => this.setState({isSubscribed: subscription}))
    }
  };

  handleSubscribe = (event) => this.updateSubscription(event, subscribe);
  handleUnsubscribe = (event) => this.updateSubscription(event, unsubscribe);

  updateSubscription = (event, subscriptionFunc) => {
    event.preventDefault();
    this.setState({isUpdatingSubscription: true});

    subscriptionFunc(this.state.usagePlanId)
        .then(this.setState({isSubscribed: !this.state.isSubscribed, isUpdatingSubscription: false}))
        .catch(err => {
          console.log('Failed to update subscription; reloading', err);
          window.setTimeout(() => window.location.reload(), 5000);
        });
  };

  subscriptionButton() {
    if (!isAuthenticated()) {
      return '';
    } else if (this.state.isSubscribed) {
      return <Button fluid onClick={this.handleUnsubscribe}>Unsubscribe</Button>
    } else {
      return <Button primary fluid onClick={this.handleSubscribe}>Subscribe</Button>
    }
  }

  render() {
    return this.state.api && !this.state.isUpdatingSubscription ? (<div>
      <QspBreadcrumb {...this.props} />

      <Segment padded>
        {this.subscriptionButton()}
        <section className="swagger-section" style={{overflow: 'auto'}}>
          <SwaggerUI spec={this.state.api.swagger} apiKey={this.state.apiKey} apiKeyProp={this.state.apiKeyProp} isSubscribed={this.state.isSubscribed}/>
        </section>
      </Segment>
    </div>) :
    (<Dimmer active inverted>
      <Loader content={this.state.isUpdatingSubscription ? 'Updating subscription' : 'Loading'} />
    </Dimmer>)
  }
}
