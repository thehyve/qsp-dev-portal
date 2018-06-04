import React, { PureComponent } from 'react'
import { Dimmer, Loader, Button, Segment} from 'semantic-ui-react'
import {
  addSubscription,
  getApi,
  lookupSubscriptions,
  isSubscribed,
  unsubscribe
} from '../../services/api-catalog'
import SwaggerUI from "../../components/SwaggerUI";
import QspBreadcrumb from '../../components/QspBreadcrumb'
import {getApiKey, isAuthenticated} from "../../services/self";

export default class ApiDetailsPage extends PureComponent {
  constructor(props) {
    super();
    this.state = {
      api: null,
      apiKey: null,
      apiKeyProp: null,
      isSubscribed: false,
      usagePlanId: null
    };

    getApi(props.match.params.apiId)
      .then(({usagePlanId, api}) => {
        const apiKeyProp = Object.keys(api.swagger.securityDefinitions)[0];
        this.setState({api, apiKeyProp, usagePlanId}, this.updateSubscription);
      });

    if (isAuthenticated()) {
      getApiKey()
          .then(key => this.setState({apiKey: key.value}));
    }
  }

  updateSubscription = () => {
    if (this.state.usagePlanId) {
      lookupSubscriptions().then(() => {
        this.setState({isSubscribed: isSubscribed(this.state.usagePlanId) ? true : false})
      });
    }
  }

  handleSubscribe = (event, usagePlanId) => {
    event.preventDefault();

    addSubscription(usagePlanId)
    .then(() => window.location.reload())
    .catch(err => {
      console.log('Failed to unsubscribe; reloading anyway', err);
      window.location.reload();
    });
  };

  handleUnsubscribe = (event, usagePlanId) => {
    event.preventDefault();

    unsubscribe(usagePlanId)
    .then(() => window.location.reload())
    .catch(err => {
      console.log('Failed to unsubscribe; reloading anyway', err);
      window.location.reload();
    });
  };

  render() {
    return (<div>
      <QspBreadcrumb {...this.props} />

      <Segment padded>
          {this.state.isSubscribed? <Button fluid onClick={event => this.handleUnsubscribe(event, this.state.usagePlanId)}>Unsubscribe</Button>  : <Button primary fluid onClick={event => this.handleSubscribe(event, this.state.usagePlanId)}>Subscribe</Button> }

        <section className="swagger-section" style={{overflow: 'auto'}}>
              {this.state.api ? <SwaggerUI spec={this.state.api.swagger} apiKey={this.state.apiKey} apiKeyProp={this.state.apiKeyProp} isSubscribed={this.state.isSubscribed}/> : (
            <Dimmer active inverted>
              <Loader content='Loading' />
            </Dimmer>)}
        </section>
      </Segment>
    </div>)

  }
}
