import { useEffect, useMemo, useState } from 'react'
import logoHeladeria from './assets/logo-heladeria.svg'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import './App.css'
import Header from './components/Header'
import LoginForm from './components/LoginForm'
import MessageAlert from './components/MessageAlert'
import Stats from './components/Stats'
import OperationsPanel from './components/OperationsPanel'
import ProductsTable from './components/ProductsTable'
import IngredientsCrud from './components/IngredientsCrud'
import SalesLog from './components/SalesLog'

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
    // Preferir productos que estén disponibles (inventario > 0).
    let mejor = null
    for (const producto of productos) {
      const metrica = calcularMetricasProducto(producto)
      if (!metrica.disponible) continue
      if (!mejor || metrica.rentabilidad > mejor.rentabilidad) {
        mejor = { producto, rentabilidad: metrica.rentabilidad }
      }
    }
    if (mejor) return mejor

    // Si ninguno está disponible, devolver el de mayor rentabilidad entre todos.
    for (const producto of productos) {
      const metrica = calcularMetricasProducto(producto)
      if (!mejor || metrica.rentabilidad > mejor.rentabilidad) {
        mejor = { producto, rentabilidad: metrica.rentabilidad }
      }
    }
    return mejor
  }, [productos, ingredientesPorId])

  const anyDisponible = useMemo(() => {
    return productos.some((p) => calcularMetricasProducto(p).disponible)
  }, [productos, ingredientesPorId])

  const productoMasVendido = useMemo(() => {
    if (!ventas || ventas.length === 0) return null
    const counts = ventas.reduce((acc, v) => {
      const id = v.producto_id
      acc[id] = (acc[id] || 0) + Number(v.cantidad || 1)
      return acc
    }, {})
    let bestId = null
    let bestCount = 0
    for (const idStr of Object.keys(counts)) {
      const c = counts[idStr]
      if (c > bestCount) {
        bestCount = c
        bestId = Number(idStr)
      }
    }
    const producto = productos.find((p) => p.id === bestId) || null
    return producto ? { producto, cantidad: bestCount } : null
  }, [ventas, productos])

  const [showSalesLog, setShowSalesLog] = useState(false)

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
      <Header logoHeladeria={logoHeladeria} usingFallback={usingFallback} rolActual={rolActual} />

      <main className="container">
        <LoginForm userSesion={userSesion} loginForm={loginForm} setLoginForm={setLoginForm} manejarLogin={manejarLogin} cerrarSesion={cerrarSesion} />

        <MessageAlert mensaje={mensaje} />

        {userSesion ? (
          <Stats ventasHoy={ventasHoy} productoMasRentable={productoMasRentable} productoMasVendido={productoMasVendido} permisos={permisos} anyDisponible={anyDisponible} />
        ) : null}

        {rolActual === 'admin' ? (
          <div className="mb-4 d-flex">
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowSalesLog(true)}>Ver registro de ventas</button>
          </div>
        ) : null}

        {showSalesLog ? <SalesLog ventas={ventas} productos={productos} users={users} onClose={() => setShowSalesLog(false)} /> : null}

        {permisos.verPanelOperaciones ? (
          <OperationsPanel permisos={permisos} operacionForm={operacionForm} setOperacionForm={setOperacionForm} manejarOperacion={manejarOperacion} opResultado={opResultado} />
        ) : null}

        <ProductsTable productos={productos} calcularMetricasProducto={calcularMetricasProducto} permisos={permisos} venderProducto={venderProducto} rolActual={rolActual} />

        <IngredientsCrud permisos={permisos} ingredienteForm={ingredienteForm} setIngredienteForm={setIngredienteForm} ingredienteEditId={ingredienteEditId} manejarGuardarIngrediente={manejarGuardarIngrediente} editarIngrediente={editarIngrediente} eliminarIngrediente={eliminarIngrediente} reabastecerIngrediente={reabastecerIngrediente} renovarInventario={renovarInventario} ingredientes={ingredientes} />
      </main>
    </div>
  )
}

export default App
