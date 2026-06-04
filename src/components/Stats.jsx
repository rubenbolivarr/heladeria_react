import React from 'react'

export default function Stats({ ventasHoy, productoMasRentable, productoMasVendido, permisos, anyDisponible }) {
  return (
    <section className="row g-3 mb-4">
      <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Ventas del dia</p><h3 className="h2 mb-0">{ventasHoy.cantidad}</h3></div></article></div>
      <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Total vendido</p><h3 className="h2 mb-0">${ventasHoy.total.toLocaleString('es-CO')}</h3></div></article></div>
      <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Producto mas rentable</p><h3 className="h6 mb-1">{!anyDisponible ? 'Ningún producto disponible actualmente' : permisos.verRentabilidad && productoMasRentable ? `${productoMasRentable.producto.nombre} ($${productoMasRentable.rentabilidad.toLocaleString('es-CO')})` : 'Visible solo para admin'}</h3>{productoMasVendido ? <p className="mb-0 text-secondary small">Más vendido: {productoMasVendido.producto.nombre} ({productoMasVendido.cantidad})</p> : <p className="mb-0 text-secondary small">No hay ventas registradas</p>}</div></article></div>
    </section>
  )
}
