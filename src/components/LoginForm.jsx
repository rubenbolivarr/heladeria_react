import React from 'react'

export default function LoginForm({ userSesion, loginForm, setLoginForm, manejarLogin, cerrarSesion }) {
  return (
    <section className="card shadow-sm border-0 mb-4">
      <div className="card-body p-4">
        <div className="row g-4 align-items-end">
          <div className="col-lg-7">
            <h2 className="h4 mb-2">{userSesion ? userSesion.nombre : 'Login'}</h2>
          </div>
          <div className="col-lg-5">
            {userSesion ? (
              <div className="d-grid">
                <button type="button" className="btn btn-outline-danger" onClick={cerrarSesion}>Cerrar sesion ({userSesion.nombre})</button>
              </div>
            ) : (
              <form className="row g-2" onSubmit={manejarLogin}>
                <div className="col-12 col-md-6"><input type="email" className="form-control" value={loginForm.correo} placeholder="Correo" onChange={(event) => setLoginForm((prev) => ({ ...prev, correo: event.target.value }))} required /></div>
                <div className="col-12 col-md-4"><input type="password" className="form-control" value={loginForm.password} placeholder="Contrasena" onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} required /></div>
                <div className="col-12 col-md-2 d-grid"><button type="submit" className="btn btn-primary">Entrar</button></div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
