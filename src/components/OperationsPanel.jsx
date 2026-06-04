import React from 'react'

export default function OperationsPanel({ permisos, operacionForm, setOperacionForm, manejarOperacion, opResultado }) {
  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Operaciones obligatorias</h2>
        <div className="row g-3 mb-3">
          <div className="col-md-3"><input className="form-control" placeholder="ID producto" value={operacionForm.productoId} onChange={(event) => setOperacionForm((prev) => ({ ...prev, productoId: event.target.value }))} /></div>
          <div className="col-md-5"><input className="form-control" placeholder="Nombre producto" value={operacionForm.productoNombre} onChange={(event) => setOperacionForm((prev) => ({ ...prev, productoNombre: event.target.value }))} /></div>
          <div className="col-md-4 d-grid d-md-flex gap-2 flex-wrap"><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => manejarOperacion('producto-por-id')}>Producto por ID</button><button type="button" className="btn btn-outline-primary btn-sm" onClick={() => manejarOperacion('producto-por-nombre')}>Producto por nombre</button></div>
          <div className="col-md-12 d-grid d-md-flex gap-2 flex-wrap"><button type="button" className="btn btn-outline-success btn-sm" onClick={() => manejarOperacion('calorias-por-id')}>Calorias por ID</button>{permisos.verCosto ? <button type="button" className="btn btn-outline-success btn-sm" onClick={() => manejarOperacion('costo-por-id')}>Costo por ID</button> : null}{permisos.verRentabilidad ? <button type="button" className="btn btn-outline-success btn-sm" onClick={() => manejarOperacion('rentabilidad-por-id')}>Rentabilidad por ID</button> : null}{permisos.vender ? <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => manejarOperacion('vender-por-id')}>Vender por ID</button> : null}</div>
        </div>

        {permisos.gestionarIngredientes ? (
          <div className="row g-3 mb-2 border-top pt-3">
            <div className="col-md-3"><input className="form-control" placeholder="ID ingrediente" value={operacionForm.ingredienteId} onChange={(event) => setOperacionForm((prev) => ({ ...prev, ingredienteId: event.target.value }))} /></div>
            <div className="col-md-5"><input className="form-control" placeholder="Nombre ingrediente" value={operacionForm.ingredienteNombre} onChange={(event) => setOperacionForm((prev) => ({ ...prev, ingredienteNombre: event.target.value }))} /></div>
            <div className="col-md-4 d-grid d-md-flex gap-2 flex-wrap"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => manejarOperacion('ingrediente-por-id')}>Ingrediente por ID</button><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => manejarOperacion('ingrediente-por-nombre')}>Ingrediente por nombre</button></div>
            <div className="col-md-12 d-grid d-md-flex gap-2 flex-wrap"><button type="button" className="btn btn-outline-dark btn-sm" onClick={() => manejarOperacion('ingrediente-sano-por-id')}>Es sano por ID</button><button type="button" className="btn btn-outline-dark btn-sm" onClick={() => manejarOperacion('reabastecer-por-id')}>Reabastecer por ID</button><button type="button" className="btn btn-outline-dark btn-sm" onClick={() => manejarOperacion('renovar-por-id')}>Renovar por ID</button></div>
          </div>
        ) : null}

        {opResultado ? <div className="alert alert-info mt-3 mb-0">{opResultado}</div> : null}
      </div>
    </section>
  )
}
