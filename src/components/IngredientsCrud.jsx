import React from 'react'

export default function IngredientsCrud({ permisos, ingredienteForm, setIngredienteForm, ingredienteEditId, manejarGuardarIngrediente, editarIngrediente, eliminarIngrediente, reabastecerIngrediente, renovarInventario, ingredientes }) {
  if (!permisos.gestionarIngredientes) return null
  return (
    <section className="card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        <h2 className="h4 m-0 mb-3">CRUD de ingredientes</h2>
        <form className="row g-2 mb-4" onSubmit={manejarGuardarIngrediente}>
          <div className="col-md-3"><input className="form-control" placeholder="Nombre" value={ingredienteForm.nombre} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, nombre: event.target.value }))} required /></div>
          <div className="col-md-2"><input type="number" className="form-control" placeholder="Precio" value={ingredienteForm.precio} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, precio: event.target.value }))} required /></div>
          <div className="col-md-2"><input type="number" className="form-control" placeholder="Calorias" value={ingredienteForm.calorias} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, calorias: event.target.value }))} required /></div>
          <div className="col-md-2"><input type="number" className="form-control" placeholder="Inventario" value={ingredienteForm.inventario} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, inventario: event.target.value }))} required /></div>
          <div className="col-md-3"><select className="form-select" value={ingredienteForm.tipo} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, tipo: event.target.value }))}><option value="base">Base</option><option value="complemento">Complemento</option></select></div>
          <div className="col-md-3"><input className="form-control" placeholder="Sabor (solo base)" value={ingredienteForm.sabor} disabled={ingredienteForm.tipo !== 'base'} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, sabor: event.target.value }))} /></div>
          <div className="col-md-3 d-flex gap-3 align-items-center"><div className="form-check"><input className="form-check-input" type="checkbox" id="vegetariano" checked={ingredienteForm.es_vegetariano} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, es_vegetariano: event.target.checked }))} /><label className="form-check-label" htmlFor="vegetariano">Vegetariano</label></div><div className="form-check"><input className="form-check-input" type="checkbox" id="sano" checked={ingredienteForm.es_sano} onChange={(event) => setIngredienteForm((prev) => ({ ...prev, es_sano: event.target.checked }))} /><label className="form-check-label" htmlFor="sano">Sano</label></div></div>
          <div className="col-md-6 d-grid d-md-flex gap-2"><button type="submit" className="btn btn-primary">{ingredienteEditId ? 'Actualizar ingrediente' : 'Crear ingrediente'}</button>{ingredienteEditId ? <button type="button" className="btn btn-outline-secondary" onClick={() => { setIngredienteForm({ nombre: '', precio: '', calorias: '', inventario: '', es_vegetariano: false, es_sano: true, tipo: 'base', sabor: '' }); }}>Cancelar</button> : null}</div>
        </form>

        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead><tr><th>Nombre</th><th>Tipo</th><th>Precio</th><th>Calorias</th><th>Inventario</th><th>Vegetariano</th><th>Sano</th><th>Acciones</th></tr></thead>
            <tbody>
              {ingredientes.map((ingrediente) => (
                <tr key={ingrediente.id}>
                  <td>{ingrediente.nombre}</td><td>{ingrediente.tipo}</td><td>${Number(ingrediente.precio).toLocaleString('es-CO')}</td><td>{ingrediente.calorias}</td><td>{ingrediente.inventario}</td><td>{ingrediente.es_vegetariano ? 'Si' : 'No'}</td><td>{ingrediente.es_sano ? 'Si' : 'No'}</td>
                  <td><div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editarIngrediente(ingrediente)}>Editar</button><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => eliminarIngrediente(ingrediente.id)}>Eliminar</button><button type="button" className="btn btn-sm btn-outline-success" onClick={() => reabastecerIngrediente(ingrediente.id)}>Reabastecer</button><button type="button" className="btn btn-sm btn-outline-dark" onClick={() => renovarInventario(ingrediente.id)}>Renovar</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
