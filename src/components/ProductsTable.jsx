import React from 'react'

export default function ProductsTable({ productos, calcularMetricasProducto, permisos, venderProducto, rolActual }) {
  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2"><h2 className="h4 m-0">Listado de productos</h2><span className="badge text-bg-light">Visible para publico</span></div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Producto</th><th>Tipo</th><th>Ingredientes</th><th>Precio publico</th>{permisos.verCalorias ? <th>Calorias</th> : null}{permisos.verCosto ? <th>Costo</th> : null}{permisos.verRentabilidad ? <th>Rentabilidad</th> : null}<th>Inventario</th>{permisos.vender ? <th>Venta</th> : null}
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => {
                const metrica = calcularMetricasProducto(producto)
                return (
                  <tr key={producto.id}>
                    <td><strong>{producto.nombre}</strong></td>
                    <td>{producto.tipo === 'copa' ? `Copa (${producto.vaso})` : `Malteada (${producto.volumen_onzas} oz)`}</td>
                    <td>{metrica.listaIngredientes.map((item) => item.nombre).join(', ')}</td>
                    <td>${Number(producto.precio_publico).toLocaleString('es-CO')}</td>
                    {permisos.verCalorias ? <td>{metrica.calorias} kcal</td> : null}
                    {permisos.verCosto ? <td>${metrica.costo.toLocaleString('es-CO')}</td> : null}
                    {permisos.verRentabilidad ? <td>${metrica.rentabilidad.toLocaleString('es-CO')}</td> : null}
                    <td><span className={`badge ${metrica.disponible ? 'text-bg-success' : 'text-bg-danger'}`}>{metrica.disponible ? 'Disponible' : 'Agotado'}</span></td>
                        {permisos.vender ? <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => venderProducto(producto)} disabled={!metrica.disponible}>{rolActual === 'cliente' ? 'Comprar' : 'Vender'}</button></td> : null}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
