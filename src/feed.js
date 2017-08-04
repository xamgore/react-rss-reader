import React from 'react'

export default function Feed(props) {
  if (!props.rss) return null

  // const tags = props.rss.tags.map(tag =>
  //   <span key={tag} className="feed__tag">{tag}</span>
  // )

  const items = props.rss.items.map(item =>
    <div key={item.guid} className="feed__item">
      <div className="item__title">
        <a href={item.link} className="item__link">
          {item.title}
        </a>
      </div>
      <div className="item__description" dangerouslySetInnerHTML={{__html: item.description}}></div>
      { item.pubDate }
    </div>
  )

  return (
    <div className="feed">
      { items ? items : 'Нету' }
    </div>
  )
}
