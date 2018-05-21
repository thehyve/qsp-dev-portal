import React from 'react'
import Loadable from 'react-loadable'
import {Dimmer} from "semantic-ui-react";
import Loader from "semantic-ui-react/dist/es/elements/Loader/Loader";

export default Loadable({
  loader: () => import('./ActualUsageChart'),
  loading: () => props => props.pastDelay ? <Dimmer active inverted><Loader content='Loading'/></Dimmer> : null,
});
