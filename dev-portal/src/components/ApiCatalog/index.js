import React, { PureComponent } from 'react'
import { Card } from 'semantic-ui-react'
import ApiCard from '../ApiCard'


export default class ApiCatalog extends PureComponent {

  render() {
    const {catalog} = this.props;
    return (
        <Card.Group itemsPerRow={3} stackable doubling>
          {catalog.map(usagePlan => usagePlan.apis.map(api => <ApiCard  usagePlan={usagePlan} api={api}/>))}
        </Card.Group>
    );
  }
}





