import React, { PureComponent } from 'react'
import { Dimmer, Loader, Button } from 'semantic-ui-react'
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
        {this.state.api ?
          (<div>        <a href = {this.state.api.extraDoc} target="_blank" rel="noopener noreferrer">
          <Button >Show PDF</Button>
        </a>

        <p>Access this API from the base URL https://{this.state.api.swagger.host}{this.state.api.swagger.basePath}, providing
        your API key in the <code>x-api-key</code> header.</p>
            <SwaggerUI spec={this.state.api.swagger}/>
          </div>) : (<Dimmer active>
          <Loader content='Loading' />
          </Dimmer>)}

      </section>
    </div>)
  }
}
