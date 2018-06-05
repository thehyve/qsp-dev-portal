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
      usagePlanId: null,
      loading: false
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
  };

  handleSubscribe = (event, usagePlanId) => {
    event.preventDefault();
    this.setState({loading: true});

    addSubscription(usagePlanId)
    .then(() => this.setState({loading: false, isSubscribed: true}))
    .catch(err => {
      console.log('Failed to subscribe; reloading anyway', err);
      window.location.reload();
    });
  };

  handleUnsubscribe = (event, usagePlanId) => {
    event.preventDefault();
    this.setState({loading: true});

    unsubscribe(usagePlanId)
    .then(() => this.setState({loading: false, isSubscribed: false}))
    .catch(err => {
      console.log('Failed to unsubscribe; reloading anyway', err);
      window.location.reload();
    });
  };

  render() {
    return  this.state.api ? (<div>
      <QspBreadcrumb {...this.props} />

      <Segment padded loading={this.state.loading}>
          {isAuthenticated() && this.state.isSubscribed? <Button fluid onClick={event => this.handleUnsubscribe(event, this.state.usagePlanId)}>Unsubscribe</Button>  : isAuthenticated() ? (<Button primary fluid onClick={event => this.handleSubscribe(event, this.state.usagePlanId)}>Subscribe</Button>) : '' }

        <section className="swagger-section" style={{overflow: 'auto'}}>
               <SwaggerUI spec={this.state.api.swagger} apiKey={this.state.apiKey} apiKeyProp={this.state.apiKeyProp} isSubscribed={this.state.isSubscribed}/>
        </section>
      </Segment>
    </div>) :
    (<Dimmer active inverted>
      <Loader content='Loading' />
    </Dimmer>)
  }
}
