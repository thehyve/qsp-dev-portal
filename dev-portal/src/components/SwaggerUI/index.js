import React, {Component} from 'react';
import PropTypes from 'prop-types';

import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle.js';
import 'swagger-ui-dist/swagger-ui.css';

class SwaggerUI extends Component {
  componentDidMount() {
    SwaggerUIBundle({
      dom_id: '#swaggerContainer',
      url: this.props.url,
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
    });
  }

  render() {
    return (
      <div id="swaggerContainer" />
    );
  }
}

SwaggerUI.propTypes = {
  url: PropTypes.string,
  spec: PropTypes.object
};

SwaggerUI.defaultProps = {
  url: `http://petstore.swagger.io/v2/swagger.json`
};

export default SwaggerUI;
