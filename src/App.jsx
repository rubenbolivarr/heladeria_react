import { useEffect, useMemo, useState } from 'react'
import logoHeladeria from './assets/logo-heladeria.svg'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import './App.css'

const fallbackUsers = [
  { id: 1, nombre: 'Administrador', correo: 'admin@admin.co', password: 'admin', rol: 'admin' },
  { id: 2, nombre: 'Empleado', correo: 'empleado@empleado.co', password: 'empleado', rol: 'empleado' },
  { id: 3, nombre: 'Cliente', correo: 'cliente@cliente.co', password: 'cliente', rol: 'cliente' },
]

const fallbackIngredientes = [
  { id: 1, nombre: 'Vainilla', precio: 1000, calorias: 150, inventario: 50, es_vegetariano: true, es_sano: true, tipo: 'base', sabor: 'vainilla' },
  { id: 2, nombre: 'Fresa', precio: 1200, calorias: 100, inventario: 40, es_vegetariano: true, es_sano: true, tipo: 'base', sabor: 'fresa' },
  { id: 3, nombre: 'Chocolate', precio: 1500, calorias: 200, inventario: 30, es_vegetariano: true, es_sano: true, tipo: 'base', sabor: 'chocolate' },
  { id: 4, nombre: 'Chispas de Chocolate', precio: 500, calorias: 50, inventario: 25, es_vegetariano: true, es_sano: false, tipo: 'complemento', sabor: null },
  { id: 5, nombre: 'Crema Batida', precio: 300, calorias: 70, inventario: 20, es_vegetariano: true, es_sano: false, tipo: 'complemento', sabor: null },
  { id: 6, nombre: 'Sirope de Fresa', precio: 400, calorias: 60, inventario: 15, es_vegetariano: true, es_sano: false, tipo: 'complemento', sabor: null },
  { id: 7, nombre: 'Oreo', precio: 800, calorias: 110, inventario: 25, es_vegetariano: true, es_sano: false, tipo: 'complemento', sabor: null },
]

const fallbackProductos = [
  { id: 1, nombre: 'Copa Vainilla Deluxe', precio_publico: 5000, tipo: 'copa', vaso: 'mediano', volumen_onzas: null, ingredienteIds: [1, 5, 4] },
  { id: 2, nombre: 'Copa ChocoFresa', precio_publico: 6000, tipo: 'copa', vaso: 'grande', volumen_onzas: null, ingredienteIds: [3, 2, 6] },
  { id: 3, nombre: 'Malteada de Fresa', precio_publico: 7000, tipo: 'malteada', vaso: null, volumen_onzas: 16, ingredienteIds: [2, 1, 5] },
  { id: 4, nombre: 'Malteada Oreo', precio_publico: 7500, tipo: 'malteada', vaso: null, volumen_onzas: 20, ingredienteIds: [3, 7, 5] },
]

const fallbackVentas = [
  { id: 1, producto_id: 1, user_id: 1, cantidad: 2, total: 10000, fecha: new Date().toISOString() },
  { id: 2, producto_id: 2, user_id: 2, cantidad: 1, total: 6000, fecha: new Date().toISOString() },
]

const emptyIngredienteForm = {
  nombre: '',
  precio: '',
  calorias: '',
  inventario: '',
  es_vegetariano: false,
  es_sano: true,
  tipo: 'base',
  sabor: '',
}

const emptyOperacionForm = {
  productoId: '',
  productoNombre: '',
  ingredienteId: '',
  ingredienteNombre: '',
}

function App() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [ingredientes, setIngredientes] = useState([])
  const [productos, setProductos] = useState([])
  const [ventas, setVentas] = useState([])
  const [userSesion, setUserSesion] = useState(null)

  const [loginForm, setLoginForm] = useState({ correo: '', password: '' })
  const [ingredienteForm, setIngredienteForm] = useState(emptyIngredienteForm)
  const [ingredienteEditId, setIngredienteEditId] = useState(null)
  const [operacionForm, setOperacionForm] = useState(emptyOperacionForm)
  const [opResultado, setOpResultado] = useState('')
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })

  const rolActual = userSesion?.rol ?? 'publico'
  const usingFallback = !isSupabaseConfigured

  const permisos = {
    gestionarIngredientes: rolActual === 'admin' || rolActual === 'empleado',
    vender: rolActual === 'admin' || rolActual === 'empleado' || rolActual === 'cliente',
    verCalorias: rolActual !== 'publico',
    verCosto: rolActual === 'admin' || rolActual === 'empleado',
    verRentabilidad: rolActual === 'admin',
    verPanelOperaciones: rolActual !== 'publico',
  }

  const cargarDatosIniciales = async () => {
    if (!isSupabaseConfigured) {
      setUsers(fallbackUsers)
      setIngredientes(fallbackIngredientes)
      setProductos(fallbackProductos)
      setVentas(fallbackVentas)
      setMensaje({ tipo: 'warning', texto: 'Modo local activo. Crea archivo .env para conectar Supabase.' })
      setLoading(false)
      return
    }

    setLoading(true)

    const [usersRes, ingRes, prodRes, relRes, ventasRes] = await Promise.all([
      supabase.from('users').select('id,nombre,correo,password,rol').order('id'),
      supabase.from('ingredientes').select('id,nombre,precio,calorias,inventario,es_vegetariano,es_sano,tipo,sabor').order('id'),
      supabase.from('productos').select('id,nombre,precio_publico,tipo,vaso,volumen_onzas').order('id'),
      supabase.from('producto_ingrediente').select('producto_id,ingrediente_id').order('producto_id'),
      supabase.from('ventas').select('id,producto_id,user_id,cantidad,total,fecha').order('id', { ascending: false }),
    ])

    const error = usersRes.error || ingRes.error || prodRes.error || relRes.error || ventasRes.error

    if (error) {
      setUsers(fallbackUsers)
      setIngredientes(fallbackIngredientes)
      setProductos(fallbackProductos)
      setVentas(fallbackVentas)
      setMensaje({ tipo: 'warning', texto: `Fallo Supabase (${error.message}). Se activa modo local.` })
      setLoading(false)
      return
    }

    const relationByProduct = (relRes.data || []).reduce((acc, rel) => {
      if (!acc[rel.producto_id]) {
        acc[rel.producto_id] = []
      }
      acc[rel.producto_id].push(rel.ingrediente_id)
      return acc
    }, {})

    const productosConIngredientes = (prodRes.data || []).map((p) => ({
      ...p,
      ingredienteIds: relationByProduct[p.id] || [],
    }))

    setUsers(usersRes.data || [])
    setIngredientes(ingRes.data || [])
    setProductos(productosConIngredientes)
    setVentas(ventasRes.data || [])
    setMensaje({ tipo: 'success', texto: 'Datos cargados desde Supabase.' })
    setLoading(false)
  }

  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  const refreshIngredientes = async () => {
    if (!isSupabaseConfigured) {
      return
    }
    const { data, error } = await supabase
      .from('ingredientes')
      .select('id,nombre,precio,calorias,inventario,es_vegetariano,es_sano,tipo,sabor')
      .order('id')
    if (!error) {
      setIngredientes(data || [])
    }
  }

  const refreshVentas = async () => {
    if (!isSupabaseConfigured) {
      return
    }
    const { data, error } = await supabase
      .from('ventas')
      .select('id,producto_id,user_id,cantidad,total,fecha')
      .order('id', { ascending: false })
    if (!error) {
      setVentas(data || [])
    }
  }

  const ingredientesPorId = useMemo(() => {
    return ingredientes.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {})
  }, [ingredientes])

  const ventasHoy = useMemo(() => {
    const inicio = new Date()
    inicio.setHours(0, 0, 0, 0)
    const delDia = ventas.filter((venta) => new Date(venta.fecha) >= inicio)
    return {
      cantidad: delDia.reduce((acc, v) => acc + Number(v.cantidad), 0),
      total: delDia.reduce((acc, v) => acc + Number(v.total), 0),
      detalle: delDia.slice(0, 5),
    }
  }, [ventas])

  const calcularMetricasProducto = (producto) => {
    const listaIngredientes = (producto.ingredienteIds || [])
      .map((id) => ingredientesPorId[id])
      .filter(Boolean)

    const costo = listaIngredientes.reduce((acc, item) => acc + Number(item.precio), 0)
    const calorias = listaIngredientes.reduce((acc, item) => acc + Number(item.calorias), 0)
    const rentabilidad = Number(producto.precio_publico) - costo
    const disponible = listaIngredientes.every((item) => Number(item.inventario) > 0)

    return { listaIngredientes, costo, calorias, rentabilidad, disponible }
  }

  const productoMasRentable = useMemo(() => {
    return productos.reduce((mejor, producto) => {
      const metrica = calcularMetricasProducto(producto)
      if (!mejor || metrica.rentabilidad > mejor.rentabilidad) {
        return { producto, rentabilidad: metrica.rentabilidad }
      }
      return mejor
    }, null)
  }, [productos, ingredientesPorId])

  const buscarProductoPorId = (idTexto) => {
    const id = Number(idTexto)
    if (Number.isNaN(id)) {
      return null
    }
    return productos.find((item) => item.id === id) || null
  }

  const buscarProductoPorNombre = (nombreTexto) => {
    const q = nombreTexto.trim().toLowerCase()
    if (!q) {
      return null
    }
    return productos.find((item) => item.nombre.toLowerCase().includes(q)) || null
  }

  const buscarIngredientePorId = (idTexto) => {
    const id = Number(idTexto)
    if (Number.isNaN(id)) {
      return null
    }
    return ingredientes.find((item) => item.id === id) || null
  }

  const buscarIngredientePorNombre = (nombreTexto) => {
    const q = nombreTexto.trim().toLowerCase()
    if (!q) {
      return null
    }
    return ingredientes.find((item) => item.nombre.toLowerCase().includes(q)) || null
  }

  const manejarLogin = async (event) => {
    event.preventDefault()
    const correo = loginForm.correo.trim()
    const password = loginForm.password

    if (!correo || !password) {
      setMensaje({ tipo: 'danger', texto: 'Completa correo y contrasena.' })
      return
    }

    if (!isSupabaseConfigured) {
      const encontrado = users.find((u) => u.correo === correo && u.password === password)
      if (!encontrado) {
        setMensaje({ tipo: 'danger', texto: 'Credenciales invalidas.' })
        return
      }
      setUserSesion(encontrado)
      setMensaje({ tipo: 'success', texto: `Sesion iniciada como ${encontrado.rol}.` })
      setLoginForm({ correo: '', password: '' })
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('id,nombre,correo,password,rol')
      .eq('correo', correo)
      .eq('password', password)
      .maybeSingle()

    if (error || !data) {
      setMensaje({ tipo: 'danger', texto: 'Credenciales invalidas.' })
      return
    }

    setUserSesion(data)
    setMensaje({ tipo: 'success', texto: `Sesion iniciada como ${data.rol}.` })
    setLoginForm({ correo: '', password: '' })
  }

  const cerrarSesion = () => {
    setUserSesion(null)
    setOpResultado('')
    setOperacionForm(emptyOperacionForm)
    setMensaje({ tipo: 'info', texto: 'Sesion cerrada. Vista en modo publico.' })
  }

  const resetearFormularioIngrediente = () => {
    setIngredienteForm(emptyIngredienteForm)
    setIngredienteEditId(null)
  }

  const manejarGuardarIngrediente = async (event) => {
    event.preventDefault()

    const payload = {
      nombre: ingredienteForm.nombre.trim(),
      precio: Number(ingredienteForm.precio),
      calorias: Number(ingredienteForm.calorias),
      inventario: Number(ingredienteForm.inventario),
      es_vegetariano: ingredienteForm.es_vegetariano,
      es_sano: ingredienteForm.es_sano,
      tipo: ingredienteForm.tipo,
      sabor: ingredienteForm.tipo === 'base' ? ingredienteForm.sabor.trim() || null : null,
    }

    if (!payload.nombre || Number.isNaN(payload.precio) || Number.isNaN(payload.calorias) || Number.isNaN(payload.inventario)) {
      setMensaje({ tipo: 'danger', texto: 'Completa nombre, precio, calorias e inventario correctamente.' })
      return
    }

    if (!isSupabaseConfigured) {
      if (ingredienteEditId) {
        setIngredientes((prev) => prev.map((i) => (i.id === ingredienteEditId ? { ...i, ...payload } : i)))
      } else {
        const nextId = ingredientes.length ? Math.max(...ingredientes.map((i) => i.id)) + 1 : 1
        setIngredientes((prev) => [...prev, { id: nextId, ...payload }])
      }
      setMensaje({ tipo: 'success', texto: 'Cambios aplicados en modo local.' })
      resetearFormularioIngrediente()
      return
    }

    if (ingredienteEditId) {
      const { error } = await supabase.from('ingredientes').update(payload).eq('id', ingredienteEditId)
      if (error) {
        setMensaje({ tipo: 'danger', texto: 'No se pudo actualizar ingrediente.' })
        return
      }
      setMensaje({ tipo: 'success', texto: 'Ingrediente actualizado.' })
    } else {
      const { error } = await supabase.from('ingredientes').insert(payload)
      if (error) {
        setMensaje({ tipo: 'danger', texto: 'No se pudo crear ingrediente.' })
        return
      }
      setMensaje({ tipo: 'success', texto: 'Ingrediente creado.' })
    }

    resetearFormularioIngrediente()
    await refreshIngredientes()
  }

  const editarIngrediente = (ingrediente) => {
    setIngredienteEditId(ingrediente.id)
    setIngredienteForm({
      nombre: ingrediente.nombre,
      precio: ingrediente.precio,
      calorias: ingrediente.calorias,
      inventario: ingrediente.inventario,
      es_vegetariano: ingrediente.es_vegetariano,
      es_sano: ingrediente.es_sano,
      tipo: ingrediente.tipo,
      sabor: ingrediente.sabor || '',
    })
  }

  const eliminarIngrediente = async (ingredienteId) => {
    const estaEnUso = productos.some((producto) => (producto.ingredienteIds || []).includes(ingredienteId))
    if (estaEnUso) {
      setMensaje({ tipo: 'warning', texto: 'No se puede eliminar: ingrediente asociado a productos.' })
      return
    }

    if (!isSupabaseConfigured) {
      setIngredientes((prev) => prev.filter((i) => i.id !== ingredienteId))
      setMensaje({ tipo: 'success', texto: 'Ingrediente eliminado (modo local).' })
      return
    }

    const { error } = await supabase.from('ingredientes').delete().eq('id', ingredienteId)
    if (error) {
      setMensaje({ tipo: 'danger', texto: 'No se pudo eliminar ingrediente.' })
      return
    }

    await refreshIngredientes()
    setMensaje({ tipo: 'success', texto: 'Ingrediente eliminado.' })
  }

  const reabastecerIngrediente = async (ingredienteId, silente = false) => {
    const actual = buscarIngredientePorId(ingredienteId)
    if (!actual) {
      return
    }
    const inventarioNuevo = Number(actual.inventario) + 10

    if (!isSupabaseConfigured) {
      setIngredientes((prev) => prev.map((i) => (i.id === actual.id ? { ...i, inventario: inventarioNuevo } : i)))
      if (!silente) {
        setMensaje({ tipo: 'info', texto: 'Inventario reabastecido (+10).' })
      }
      return
    }

    const { error } = await supabase.from('ingredientes').update({ inventario: inventarioNuevo }).eq('id', actual.id)
    if (error) {
      setMensaje({ tipo: 'danger', texto: 'No se pudo reabastecer ingrediente.' })
      return
    }

    await refreshIngredientes()
    if (!silente) {
      setMensaje({ tipo: 'info', texto: 'Inventario reabastecido (+10).' })
    }
  }

  const renovarInventario = async (ingredienteId, silente = false) => {
    const actual = buscarIngredientePorId(ingredienteId)
    if (!actual) {
      return false
    }
    if (actual.tipo !== 'complemento') {
      if (!silente) {
        setMensaje({ tipo: 'warning', texto: 'Solo complementos se renuevan a 0.' })
      }
      return false
    }

    if (!isSupabaseConfigured) {
      setIngredientes((prev) => prev.map((i) => (i.id === actual.id ? { ...i, inventario: 0 } : i)))
      if (!silente) {
        setMensaje({ tipo: 'info', texto: 'Inventario renovado a 0.' })
      }
      return true
    }

    const { error } = await supabase.from('ingredientes').update({ inventario: 0 }).eq('id', actual.id)
    if (error) {
      setMensaje({ tipo: 'danger', texto: 'No se pudo renovar inventario.' })
      return false
    }

    await refreshIngredientes()
    if (!silente) {
      setMensaje({ tipo: 'info', texto: 'Inventario renovado a 0.' })
    }
    return true
  }

  const venderProducto = async (producto, silente = false) => {
    const metrica = calcularMetricasProducto(producto)
    if (!metrica.disponible) {
      if (!silente) {
        setMensaje({ tipo: 'danger', texto: `No hay inventario para ${producto.nombre}.` })
      }
      return false
    }

    if (!isSupabaseConfigured) {
      setIngredientes((prev) =>
        prev.map((item) => {
          if (!(producto.ingredienteIds || []).includes(item.id)) {
            return item
          }
          return { ...item, inventario: Number(item.inventario) - 1 }
        }),
      )
      setVentas((prev) => [
        {
          id: prev.length + 1,
          producto_id: producto.id,
          user_id: userSesion?.id ?? null,
          cantidad: 1,
          total: Number(producto.precio_publico),
          fecha: new Date().toISOString(),
        },
        ...prev,
      ])
      if (!silente) {
        setMensaje({ tipo: 'success', texto: `Venta registrada: ${producto.nombre}.` })
      }
      return true
    }

    for (const ingrediente of metrica.listaIngredientes) {
      const { error } = await supabase
        .from('ingredientes')
        .update({ inventario: Number(ingrediente.inventario) - 1 })
        .eq('id', ingrediente.id)
      if (error) {
        setMensaje({ tipo: 'danger', texto: 'Fallo al actualizar inventario en la venta.' })
        return false
      }
    }

    const { error: ventaError } = await supabase.from('ventas').insert({
      producto_id: producto.id,
      user_id: userSesion?.id ?? null,
      cantidad: 1,
      total: Number(producto.precio_publico),
    })

    if (ventaError) {
      setMensaje({ tipo: 'danger', texto: 'No se pudo registrar la venta.' })
      return false
    }

    await Promise.all([refreshIngredientes(), refreshVentas()])
    if (!silente) {
      setMensaje({ tipo: 'success', texto: `Venta registrada: ${producto.nombre}.` })
    }
    return true
  }

  const manejarOperacion = async (tipo) => {
    if (tipo === 'producto-por-id') {
      const producto = buscarProductoPorId(operacionForm.productoId)
      setOpResultado(producto ? `Producto: ${producto.nombre} (ID ${producto.id})` : 'No se encontro producto por ID.')
      return
    }
    if (tipo === 'producto-por-nombre') {
      const producto = buscarProductoPorNombre(operacionForm.productoNombre)
      setOpResultado(producto ? `Producto: ${producto.nombre} (ID ${producto.id})` : 'No se encontro producto por nombre.')
      return
    }
    if (tipo === 'calorias-por-id') {
      const producto = buscarProductoPorId(operacionForm.productoId)
      if (!producto) {
        setOpResultado('No se encontro producto para calorias.')
        return
      }
      const m = calcularMetricasProducto(producto)
      setOpResultado(`Calorias de ${producto.nombre}: ${m.calorias} kcal.`)
      return
    }
    if (tipo === 'costo-por-id') {
      const producto = buscarProductoPorId(operacionForm.productoId)
      if (!producto) {
        setOpResultado('No se encontro producto para costo.')
        return
      }
      const m = calcularMetricasProducto(producto)
      setOpResultado(`Costo de ${producto.nombre}: $${m.costo.toLocaleString('es-CO')}.`)
      return
    }
    if (tipo === 'rentabilidad-por-id') {
      const producto = buscarProductoPorId(operacionForm.productoId)
      if (!producto) {
        setOpResultado('No se encontro producto para rentabilidad.')
        return
      }
      const m = calcularMetricasProducto(producto)
      setOpResultado(`Rentabilidad de ${producto.nombre}: $${m.rentabilidad.toLocaleString('es-CO')}.`)
      return
    }
    if (tipo === 'vender-por-id') {
      const producto = buscarProductoPorId(operacionForm.productoId)
      if (!producto) {
        setOpResultado('No se encontro producto para vender.')
        return
      }
      const ok = await venderProducto(producto, true)
      setOpResultado(ok ? `Venta ejecutada para ${producto.nombre}.` : 'No fue posible completar la venta.')
      return
    }
    if (tipo === 'ingrediente-por-id') {
      const ingrediente = buscarIngredientePorId(operacionForm.ingredienteId)
      setOpResultado(ingrediente ? `Ingrediente: ${ingrediente.nombre} (ID ${ingrediente.id})` : 'No se encontro ingrediente por ID.')
      return
    }
    if (tipo === 'ingrediente-por-nombre') {
      const ingrediente = buscarIngredientePorNombre(operacionForm.ingredienteNombre)
      setOpResultado(ingrediente ? `Ingrediente: ${ingrediente.nombre} (ID ${ingrediente.id})` : 'No se encontro ingrediente por nombre.')
      return
    }
    if (tipo === 'ingrediente-sano-por-id') {
      const ingrediente = buscarIngredientePorId(operacionForm.ingredienteId)
      if (!ingrediente) {
        setOpResultado('No se encontro ingrediente para validar salud.')
        return
      }
      setOpResultado(`${ingrediente.nombre} ${ingrediente.es_sano ? 'si es' : 'no es'} sano.`)
      return
    }
    if (tipo === 'reabastecer-por-id') {
      const ingrediente = buscarIngredientePorId(operacionForm.ingredienteId)
      if (!ingrediente) {
        setOpResultado('No se encontro ingrediente para reabastecer.')
        return
      }
      await reabastecerIngrediente(ingrediente.id, true)
      setOpResultado(`Reabastecido ${ingrediente.nombre} (+10).`)
      return
    }
    if (tipo === 'renovar-por-id') {
      const ingrediente = buscarIngredientePorId(operacionForm.ingredienteId)
      if (!ingrediente) {
        setOpResultado('No se encontro ingrediente para renovar.')
        return
      }
      const ok = await renovarInventario(ingrediente.id, true)
      setOpResultado(ok ? `Inventario renovado para ${ingrediente.nombre}.` : 'Solo complementos se renuevan a 0.')
    }
  }

  if (loading) {
    return <div className="container py-5"><div className="alert alert-info">Cargando datos...</div></div>
  }

  return (
    <div className="app-shell pb-5">
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

      <main className="container">
        <section className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="row g-4 align-items-end">
              <div className="col-lg-7">
                <h2 className="h4 mb-2">Login</h2>
                <p className="text-secondary mb-0">Autenticacion por tabla users segun el manual.</p>
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

        {mensaje.texto ? <div className={`alert alert-${mensaje.tipo || 'info'} mb-4`}>{mensaje.texto}</div> : null}

        <section className="row g-3 mb-4">
          <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Ventas del dia</p><h3 className="h2 mb-0">{ventasHoy.cantidad}</h3></div></article></div>
          <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Total vendido</p><h3 className="h2 mb-0">${ventasHoy.total.toLocaleString('es-CO')}</h3></div></article></div>
          <div className="col-md-4"><article className="card border-0 shadow-sm h-100 stat-card"><div className="card-body"><p className="mb-1 text-secondary">Producto mas rentable</p><h3 className="h6 mb-0">{permisos.verRentabilidad && productoMasRentable ? `${productoMasRentable.producto.nombre} ($${productoMasRentable.rentabilidad.toLocaleString('es-CO')})` : 'Visible solo para admin'}</h3></div></article></div>
        </section>

        {permisos.verPanelOperaciones ? (
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
        ) : null}

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
                        {permisos.vender ? <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => venderProducto(producto)} disabled={!metrica.disponible}>Vender</button></td> : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {permisos.gestionarIngredientes ? (
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
                <div className="col-md-6 d-grid d-md-flex gap-2"><button type="submit" className="btn btn-primary">{ingredienteEditId ? 'Actualizar ingrediente' : 'Crear ingrediente'}</button>{ingredienteEditId ? <button type="button" className="btn btn-outline-secondary" onClick={resetearFormularioIngrediente}>Cancelar</button> : null}</div>
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
        ) : null}
      </main>
    </div>
  )
}

export default App
