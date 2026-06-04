import React from 'react'

export default function ProductsTable({ productos, calcularMetricasProducto, permisos, venderProducto, rolActual }) {
  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h2 className="h4 m-0">Listado de productos</h2>
          <span className="badge text-bg-light">Visible para público</span>
        </div>

        {productos.length === 0 ? (
          <div className="alert alert-secondary mb-0">No hay productos disponibles.</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
            {productos.map((producto) => {
              const metrica = calcularMetricasProducto(producto)
              return (
                <div className="col" key={producto.id}>
                  <article className="card h-100 border-0 shadow-sm product-card">
                    <div className="card-body d-flex flex-column">
                      <div className="product-card-header mb-3 p-3 rounded-3">
                        <h3 className="h5 mb-1 product-card-title">{producto.nombre}</h3>
                        <p className="text-muted small mb-0">
                          {producto.tipo === 'copa'
                            ? `Copa ${producto.vaso}`
                            : `Malteada ${producto.volumen_onzas} oz`}
                        </p>
                      </div>

                      <span className={`badge ${metrica.disponible ? 'text-bg-success' : 'text-bg-danger'}`}>
                        {metrica.disponible ? 'Disponible' : 'Agotado'}
                      </span>

                      <div className="mb-3 text-sm">
                        <p className="mb-2"><strong>Ingredientes:</strong> {metrica.listaIngredientes.map((item) => item.nombre).join(', ')}</p>
                        <p className="mb-0"><strong>Precio público:</strong> ${Number(producto.precio_publico).toLocaleString('es-CO')}</p>
                      </div>

                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {permisos.verCalorias ? <span className="badge text-bg-secondary">Calorías: {metrica.calorias} kcal</span> : null}
                        {permisos.verCosto ? <span className="badge text-bg-secondary">Costo: ${metrica.costo.toLocaleString('es-CO')}</span> : null}
                        {permisos.verRentabilidad ? <span className="badge text-bg-secondary">Rentabilidad: ${metrica.rentabilidad.toLocaleString('es-CO')}</span> : null}
                      </div>

                      {permisos.vender ? (
                        <div className="mt-auto">
                          <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={() => venderProducto(producto)}
                            disabled={!metrica.disponible}
                          >
                            {rolActual === 'cliente' ? 'Comprar' : 'Vender'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
