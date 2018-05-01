import React, { PureComponent } from 'react'
import { Dimmer, Loader} from 'semantic-ui-react'
import { getApi } from '../../services/api-catalog'
import Head from '../../components/Head'
import SwaggerUI from "../../components/SwaggerUI";

export default class ApiDetailsPage extends PureComponent {
  constructor(props) {
    super();
    this.state = {};

    getApi(props.match.params.apiId)
    .then(api => {
      this.setState({
        api
      });
    })
  }

  render() {
    return (<div>
      <Head {...this.props} />
      <section className="swagger-section" style={{overflow: 'auto'}}>
        {this.state.api ? <SwaggerUI spec={this.state.api.swagger}/> : (
          <Dimmer active>
            <Loader content='Loading' />
          </Dimmer>)}
      </section>
    </div>)
  }
}
