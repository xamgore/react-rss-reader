import React, { Component } from 'react'
import Input from './input'
import Err from './error'
import Feed from './feed'
import './App.css'

import get from 'lodash.get'
import map from 'lodash.map'
import merge from 'lodash.merge'
import mapValues from 'lodash.mapvalues'
import zipToObject from 'lodash.zipobject'
import axios from 'axios'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rss: null
      // error: null,
    }
  }

  componentDidMount() {
    this.changeUrl({target:{value:'http://yandex.ru/'}})
  }

  error(msg) {
    console.error(msg)
    this.setState({ error: msg.toString() })
  }

  changeUrl(e) {
    const url = e.target.value;

    this.setState({ error: null, rss: null })
    if (!url || !url.length) return

    axios.get(url)
      .then(res => this.getRSSLink(url, res.data))
      .catch(err => this.error(err))
  }

  getRSSLink(url, html) {
    const a = document.createElement('a')
    a.href = url

    const doc = document.createElement('template')
    doc.innerHTML = html

    const query = 'link[type=application\\/rss\\+xml][rel=alternate]'
    const link = get(doc.content.querySelector(query), 'attributes.href.value')
    if (!link) return this.error('RSS link was not found')

    const base = `${a.protocol}//${a.hostname}${a.port}`

    axios.get(link, { baseURL: base })
      .then(res => this.parseRSSFeed(res.data))
      .catch(err => this.error(err))
  }

  parseItems(items) {
    if (!items) return []

    const fields = {
      guid: 'guid',
      link: 'link',
      title: 'title',
      date: 'pubDate',
      author: 'dc\\:creator'
    }

    const removeCDATA = s => s && s.replace(/<!(?:--)?\[CDATA\[ ?([^]*?)\] ?\](?:--)?(?:>|&gt;)/g, '$1')
    const fetchFrom = (xml, field) => (xml.querySelector(field) || {})

    return map(items, i => {
      const base = mapValues(fields, f => removeCDATA(fetchFrom(i, f).innerText))
      const desc = fetchFrom(i, 'description').innerHTML

      return merge(base, { description: removeCDATA(desc) })
    })
  }

  parseChannel(doc) {
    const fields = ['link', 'title', 'description']
    const select = f => (doc.querySelector(`channel > ${f}`) || {}).innerText
    const selectAll = f => doc.querySelectorAll(`channel ${f}`) || []

    const singleElements = zipToObject(fields, map(fields, select))

    return merge(singleElements, {
      // tags: map(selectAll('> category'), node => node.innerText),
      items: this.parseItems(selectAll('item'))
    })
  }

  parseRSSFeed(xml) {
    let doc = document.createElement('template')
    doc.innerHTML = xml
    doc = doc.content

    console.log(doc);

    this.setState({ ...this.state, rss: this.parseChannel(doc) })
  }

  render() {
    return (
      <div className="app">
        <Input onChange={this.changeUrl.bind(this)} />

        {this.state.error ? (
          <Err err={this.state.error}/>
        ) : (
          <Feed rss={this.state.rss}/>
        )}
      </div>
    );
  }
}

export default App
