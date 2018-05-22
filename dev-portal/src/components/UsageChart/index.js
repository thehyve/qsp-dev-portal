import React from 'react'
import Loadable from 'react-loadable'
import {Dimmer, Loader} from "semantic-ui-react";

export default Loadable({
  loader: () => import('./ActualUsageChart'),
  loading: props => props.pastDelay ? <Dimmer active inverted><Loader content='Loading'/></Dimmer> : null,
});
