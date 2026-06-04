import React from 'react'

export default function MessageAlert({ mensaje }) {
  if (!mensaje || !mensaje.texto) return null
  return <div className={`alert alert-${mensaje.tipo || 'info'} mb-4`}>{mensaje.texto}</div>
}
