import React from 'react'

export default function Header({ logoHeladeria, usingFallback, rolActual }) {
  return (
    <header className="top-hero py-4 py-md-5 mb-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <img src={logoHeladeria} alt="Logo Heladeria Sierra Dulce" className="brand-logo" />
            <div>
              <div className="brand-badge mb-2">NEVADO ANDINO</div>
              <h1 className="display-6 fw-bold text-white mb-2">Heladeria Sierra Dulce</h1>
              <p className="text-white-50 mb-0">{usingFallback ? 'Modo local (sin .env)' : 'Conectado a Supabase'}</p>
            </div>
          </div>
          <div className="role-chip">Rol actual: {rolActual}</div>
        </div>
      </div>
    </header>
  )
}
