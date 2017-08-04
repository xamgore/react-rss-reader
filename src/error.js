import React from 'react'

export default function (props) {
  if (!props.err) return null

  return (
    <div className="error">
      { props.err }
    </div>
  )
}
