import React, { Component } from 'react';
import debounce from 'lodash.debounce';

export default class extends Component {
  constructor(props) {
    super(props)
    this.onChange = debounce(props.onChange, 400)
  }

  render() {
    return (
      <input placeholder="http://yandex.ru/" onChange={e => e.persist() || this.onChange(e)} />
    )
  }
}
