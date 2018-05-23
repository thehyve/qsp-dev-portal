import React, {Component} from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle'
import 'swagger-ui-dist/swagger-ui.css'

class ActualSwaggerUI extends Component {
  state = {
    swagger: null,
    isLoaded: false,
  };

  componentDidMount() {
    const swagger = SwaggerUIBundle({
      dom_id: '#swaggerContainer',
      url: this.props.url ? this.props.url : 'http://petstore.swagger.io/v2/swagger.json',
      spec: this.props.spec,
      validatorUrl: null,
      highlightSizeThreshold: 5000,
      supportedSubmitMethods: [
        'get', 'post', 'put', 'delete', 'patch'
      ],
      jsonEditor: false,
      defaultModelRendering: 'schema',
      docExpansion: 'list',
      showRequestHeaders: false,
      onComplete: () => this.setState({isLoaded: true})
    });
    this.setState({swagger});
  }

  componentDidUpdate() {
    this.handleAuth();
  }

  handleAuth = () => {
    if (this.state.isLoaded && this.props.apiKey && this.props.apiKeyProp) {
      this.state.swagger.preauthorizeApiKey(this.props.apiKeyProp, this.props.apiKey);
    }
  };

  render() {
    return (
      <div id="swaggerContainer" />
    );
  }
}

export default ActualSwaggerUI;
