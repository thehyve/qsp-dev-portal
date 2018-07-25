import React, {PureComponent} from 'react'
import './Footer.css'

export default class Footer extends PureComponent {
  render() {
    return (
      <footer className="Footer">
        <small>&copy; 2018 Quisper</small><br/>
        <small><a href="https://quisper.eu/terms-and-conditions/">Terms and conditions</a> | <a href="http://quisper.eu/privacy-policy/">Privacy policy</a></small>
      </footer>
    )
  }
}
