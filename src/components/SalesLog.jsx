import React, { useEffect, useMemo, useState } from 'react'

export default function SalesLog({ ventas, productos, users, onClose }) {
  const productoPorId = (id) => productos.find((p) => p.id === id)
  const usuarioPorId = (id) => users.find((u) => u.id === id)

  const [paginaActual, setPaginaActual] = useState(1)
  const registrosPorPagina = 20

  useEffect(() => {
    setPaginaActual(1)
  }, [ventas])

  const ventasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina
    return ventas.slice(inicio, inicio + registrosPorPagina)
  }, [ventas, paginaActual])

  const totalPaginas = Math.max(1, Math.ceil(ventas.length / registrosPorPagina))
  const [pageInput, setPageInput] = useState('')

  const handleJump = () => {
    const n = Number(pageInput)
    if (!Number.isInteger(n)) return setPageInput('')
    const target = Math.min(Math.max(1, n), totalPaginas)
    setPaginaActual(target)
    setPageInput('')
  }

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
          <>
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
                  {ventasPaginadas.map((v) => {
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

            {ventas.length > registrosPorPagina ? (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <small className="text-muted">Mostrando {ventasPaginadas.length} de {ventas.length} ventas</small>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm" role="group">
                    <button type="button" className="btn btn-outline-primary" disabled={paginaActual === 1} onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}>Anterior</button>
                    <button type="button" className="btn btn-outline-primary" disabled>{paginaActual} / {totalPaginas}</button>
                    <button type="button" className="btn btn-outline-primary" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}>Siguiente</button>
                  </div>

                  <select className="form-select form-select-sm" style={{width: '5.5rem'}} value={paginaActual} onChange={(e) => setPaginaActual(Number(e.target.value))}>
                    {Array.from({ length: totalPaginas }).map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>

                  <div className="d-flex gap-1 align-items-center">
                    <input type="number" min="1" max={totalPaginas} className="form-control form-control-sm" style={{width: '5.5rem'}} placeholder="Ir a" value={pageInput} onChange={(e) => setPageInput(e.target.value)} />
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleJump}>Ir</button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
