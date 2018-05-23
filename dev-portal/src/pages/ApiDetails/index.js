import React, { PureComponent } from 'react'
import { Dimmer, Loader} from 'semantic-ui-react'
import { getApi } from '../../services/api-catalog'
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
    };

    getApi(props.match.params.apiId)
      .then(api => this.setState({api, apiKeyProp: Object.keys(api.swagger.securityDefinitions)[0]}));

    if (isAuthenticated()) {
      getApiKey()
          .then(key => this.setState({apiKey: key.value}));
    }
  }

  render() {
    return (<div>
      <QspBreadcrumb {...this.props} />
      <section className="swagger-section" style={{overflow: 'auto'}}>
        {this.state.api ? <SwaggerUI spec={this.state.api.swagger} apiKey={this.state.apiKey} apiKeyProp={this.state.apiKeyProp}/> : (
          <Dimmer active inverted>
            <Loader content='Loading' />
          </Dimmer>)}
      </section>
    </div>)
  }
}
