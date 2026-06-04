import React from 'react'

export default function SalesLog({ ventas, productos, users, onClose }) {
  const productoPorId = (id) => productos.find((p) => p.id === id)
  const usuarioPorId = (id) => users.find((u) => u.id === id)

  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 m-0">Registro de ventas</h2>
          <div><button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>Cerrar</button></div>
        </div>
        {ventas.length === 0 ? (
          <div className="alert alert-info">No hay ventas registradas.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-striped">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Usuario</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => {
                  const p = productoPorId(v.producto_id)
                  const u = usuarioPorId(v.user_id)
                  return (
                    <tr key={v.id}>
                      <td>{new Date(v.fecha).toLocaleString()}</td>
                      <td>{p ? p.nombre : `ID ${v.producto_id}`}</td>
                      <td>{u ? u.nombre : (v.user_id ? `ID ${v.user_id}` : 'Anonimo')}</td>
                      <td>{v.cantidad}</td>
                      <td>${Number(v.total).toLocaleString('es-CO')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
