import React, {PureComponent} from 'react'
import './Footer.css'

export default class Footer extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <footer className="Footer">
        <small>&copy; 2018 QUISPER</small>
      </footer>
    )
  }
}
