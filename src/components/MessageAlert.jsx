import React, { useEffect, useState } from 'react'

export default function MessageAlert({ mensaje, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!mensaje || !mensaje.texto) {
      setVisible(false)
      return
    }

    setVisible(true)
    const hideTimer = setTimeout(() => setVisible(false), 5000)
    const clearTimer = setTimeout(() => {
      if (onDismiss) onDismiss()
    }, 5200)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(clearTimer)
    }
  }, [mensaje, onDismiss])

  if (!mensaje || !mensaje.texto) return null

  return (
    <div className={`alert alert-${mensaje.tipo || 'info'} mb-4 message-alert ${visible ? 'show' : ''}`}>
      {mensaje.texto}
    </div>
  )
}
