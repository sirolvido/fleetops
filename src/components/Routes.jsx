import { useState, useEffect } from 'react'
import { MapPin, Clock, Truck, User, X, Pencil, Trash2, Zap, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmModal from './ConfirmModal'

const statusConfig = {
  'pending':     { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  'in-progress': { label: 'En curso',    color: 'bg-blue-100 text-blue-700' },
  'completed':   { label: 'Completada',  color: 'bg-green-100 text-green-700' },
}

const emptyForm = {
  origin: 'Madrid', destination: 'Barcelona',
  driverId: '', truckId: '', cargoId: '',
  departure: '', status: 'pending',
  duration: '', actualDuration: '',
}

// Lógica de asignación automática basada en reglas
function autoAssign(pendingRoutes, availableDrivers, availableTrucks, cargo) {
  const assignments = []
  const usedDrivers = new Set()
  const usedTrucks = new Set()

  for (const route of pendingRoutes) {
    // Encontrar la carga de la ruta
    const routeCargo = cargo.find(c => c.id === route.cargo)
    const cargoWeight = routeCargo?.weight || 0

    // Filtrar camiones disponibles con capacidad suficiente
    const suitableTrucks = availableTrucks
      .filter(t => !usedTrucks.has(t.id) && t.capacity >= cargoWeight)
      .sort((a, b) => a.capacity - b.capacity) // El más ajustado primero

    // Filtrar conductores disponibles no usados
    const suitableDrivers = availableDrivers
      .filter(d => !usedDrivers.has(d.id))
      .sort((a, b) => {
        // Priorizar C+E para tráilers, experiencia como desempate
        const truckType = suitableTrucks[0]?.type || ''
        const needsCE = truckType === 'Tráiler'
        if (needsCE) {
          if (a.license === 'C+E' && b.license !== 'C+E') return -1
          if (b.license === 'C+E' && a.license !== 'C+E') return 1
        }
        return b.experience - a.experience
      })

    if (suitableDrivers.length === 0 || suitableTrucks.length === 0) continue

    const bestDriver = suitableDrivers[0]
    const bestTruck = suitableTrucks[0]

    usedDrivers.add(bestDriver.id)
    usedTrucks.add(bestTruck.id)

    // Generar razón explicativa
    const reasons = []
    if (bestDriver.license === 'C+E') reasons.push(`licencia C+E apta para ${bestTruck.type}`)
    reasons.push(`${bestDriver.experience} años de experiencia`)
    if (cargoWeight > 0) reasons.push(`capacidad ${(bestTruck.capacity/1000).toFixed(0)}T cubre los ${(cargoWeight/1000).toFixed(1)}T de carga`)
    if (bestDriver.hoursThisWeek < 40) reasons.push(`${bestDriver.hoursThisWeek}h acumuladas esta semana`)

    assignments.push({
      routeId: route.id,
      routeName: `${route.origin} → ${route.destination}`,
      driverId: bestDriver.id,
      driverName: bestDriver.name,
      truckId: bestTruck.id,
      truckPlate: bestTruck.plate,
      truckType: bestTruck.type,
      reason: reasons.join(', ') + '.',
    })
  }

  return assignments
}

export default function Routes() {
  const { routes, setRoutes, drivers, trucks, cargo, cities, calcDistance, calcEstimatedDuration, formatDuration } = useApp()
  const [selected, setSelected] = useState(null)
  const [MapComponents, setMapComponents] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [showAI, setShowAI] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiLoading, setAiLoading] = useState(false)

  const cityNames = Object.keys(cities)

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl]) => setMapComponents(rl))
  }, [])

  useEffect(() => {
    if (form.origin && form.destination && form.origin !== form.destination) {
      const originCoords = cities[form.origin]
      const destCoords = cities[form.destination]
      if (originCoords && destCoords) {
        const dist = calcDistance(originCoords, destCoords)
        const estimated = calcEstimatedDuration(dist)
        setForm(prev => ({ ...prev, duration: estimated }))
      }
    }
  }, [form.origin, form.destination])

  const getDriver = (id) => drivers.find(d => d.id === id)
  const getTruck = (id) => trucks.find(t => t.id === id)

  const validate = () => {
    const newErrors = {}
    if (!form.origin) newErrors.origin = 'Selecciona origen'
    if (!form.destination) newErrors.destination = 'Selecciona destino'
    if (form.origin === form.destination) newErrors.destination = 'Origen y destino no pueden ser iguales'
    if (!form.departure) newErrors.departure = 'Introduce fecha y hora de salida'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const originCoords = cities[form.origin] || [40.4168, -3.7038]
    const destinationCoords = cities[form.destination] || [41.3851, 2.1734]
    const distance = calcDistance(originCoords, destinationCoords)
    const duration = form.duration ? parseFloat(form.duration) : calcEstimatedDuration(distance)

    if (editingId !== null) {
      setRoutes(prev => prev.map(r => r.id === editingId ? {
        ...r, origin: form.origin, destination: form.destination,
        originCoords, destinationCoords,
        driver: form.driverId ? parseInt(form.driverId) : null,
        truck: form.truckId ? parseInt(form.truckId) : null,
        cargo: form.cargoId ? parseInt(form.cargoId) : null,
        departure: form.departure, status: form.status,
        duration, estimatedTime: formatDuration(duration), distance,
        actualDuration: form.actualDuration ? parseFloat(form.actualDuration) : null,
      } : r))
    } else {
      setRoutes(prev => [...prev, {
        id: routes.length + 1, origin: form.origin, destination: form.destination,
        originCoords, destinationCoords,
        driver: form.driverId ? parseInt(form.driverId) : null,
        truck: form.truckId ? parseInt(form.truckId) : null,
        cargo: form.cargoId ? parseInt(form.cargoId) : null,
        status: form.status, distance, estimatedTime: formatDuration(duration),
        duration, departure: form.departure, arrival: '', progress: 0, actualDuration: null,
      }])
    }
    handleClose()
  }

  const handleEdit = (route) => {
    setEditingId(route.id)
    setForm({
      origin: route.origin, destination: route.destination,
      driverId: route.driver || '', truckId: route.truck || '',
      cargoId: route.cargo || '', departure: route.departure,
      status: route.status, duration: route.duration || '',
      actualDuration: route.actualDuration || '',
    })
    setShowModal(true)
  }

  const handleClose = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setErrors({}) }

  const handleAutoAssign = () => {
    setShowAI(true)
    setAiLoading(true)
    setAiSuggestions([])

    const pendingRoutes = routes.filter(r => r.status === 'pending' && (!r.driver || !r.truck))
    const availableDrivers = drivers.filter(d => d.status === 'available')
    const availableTrucks = trucks.filter(t => t.status === 'available')

    setTimeout(() => {
      if (pendingRoutes.length === 0) {
        setAiSuggestions([{ type: 'info', message: 'No hay rutas pendientes sin asignar.' }])
      } else {
        const suggestions = autoAssign(pendingRoutes, availableDrivers, availableTrucks, cargo)
        if (suggestions.length === 0) {
          setAiSuggestions([{ type: 'info', message: 'No hay conductores o vehículos disponibles para asignar.' }])
        } else {
          setAiSuggestions(suggestions)
        }
      }
      setAiLoading(false)
    }, 1200) // Simula tiempo de procesamiento
  }

  const handleAcceptSuggestion = (suggestion) => {
    setRoutes(prev => prev.map(r => r.id === suggestion.routeId ? {
      ...r,
      driver: suggestion.driverId,
      truck: suggestion.truckId,
    } : r))
    setAiSuggestions(prev => prev.filter(s => s.routeId !== suggestion.routeId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
          <p className="text-gray-500 text-sm mt-1">{routes.length} rutas registradas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAutoAssign}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Zap size={15} />
            Asignación IA
          </button>
          <button onClick={() => { setEditingId(null); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
            + Nueva ruta
          </button>
        </div>
      </div>

      {/* Panel de asignación IA */}
      {showAI && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-purple-50 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">Asignación automática por IA</span>
            </div>
            <button onClick={() => setShowAI(false)} className="text-purple-400 hover:text-purple-600"><X size={16} /></button>
          </div>

          <div className="p-5">
            {aiLoading ? (
              <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                <Loader size={16} className="animate-spin text-purple-500" />
                Analizando rutas, conductores y vehículos disponibles...
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="text-sm text-gray-500 py-2">No hay sugerencias disponibles.</div>
            ) : aiSuggestions[0]?.type === 'info' ? (
              <div className="text-sm text-gray-600 py-2">{aiSuggestions[0].message}</div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-3">La IA ha analizado disponibilidad, licencias, experiencia y capacidad de carga para sugerir las asignaciones óptimas:</p>
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm mb-2">{s.routeName}</div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1.5"><User size={11} className="text-blue-500" /> <span className="font-medium text-gray-700">{s.driverName}</span></div>
                        <div className="flex items-center gap-1.5"><Truck size={11} className="text-blue-500" /> <span className="font-medium text-gray-700">{s.truckPlate}</span> <span className="text-gray-400">({s.truckType})</span></div>
                        <div className="mt-1.5 text-gray-400 italic text-xs">✓ {s.reason}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAcceptSuggestion(s)}
                        className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <CheckCircle size={13} /> Aceptar
                      </button>
                      <button
                        onClick={() => setAiSuggestions(prev => prev.filter((_, idx) => idx !== i))}
                        className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <XCircle size={13} /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {routes.map(route => {
            const status = statusConfig[route.status]
            const driver = getDriver(route.driver)
            const truck = getTruck(route.truck)
            const isSelected = selected?.id === route.id
            const isLate = route.actualDuration && route.duration && route.actualDuration > route.duration * 1.1
            return (
              <div key={route.id} onClick={() => setSelected(route)} className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-800">{route.origin} → {route.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    {route.status === 'completed' && route.actualDuration && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isLate ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isLate ? '⚠ Retraso' : '✓ A tiempo'}
                      </span>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleEdit(route) }} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(route) }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1"><Clock size={11} /> Est: {route.estimatedTime}</span>
                  <span>{route.distance} km</span>
                  {route.actualDuration && (
                    <span className={`font-medium ${isLate ? 'text-red-500' : 'text-green-600'}`}>Real: {formatDuration(route.actualDuration)}</span>
                  )}
                </div>
                {route.status === 'in-progress' && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progreso</span><span>{route.progress}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${route.progress}%` }}></div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {driver ? <span className="flex items-center gap-1"><User size={11} /> {driver.name}</span> : <span className="text-orange-500">Sin conductor asignado</span>}
                  {truck && <span className="flex items-center gap-1"><Truck size={11} /> {truck.plate}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
          {MapComponents ? (() => {
            const { MapContainer, TileLayer, Marker, Popup, Polyline } = MapComponents
            return (
              <MapContainer center={[40.4168, -3.7038]} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                {routes.map(route => (
                  <Polyline key={route.id} positions={[route.originCoords, route.destinationCoords]}
                    color={route.status === 'in-progress' ? '#3b82f6' : route.status === 'completed' ? '#10b981' : '#f59e0b'}
                    weight={route.id === selected?.id ? 4 : 2} opacity={route.id === selected?.id ? 1 : 0.5}
                  />
                ))}
                {routes.map((route, idx) => (
                  <div key={`markers-${route.id}-${idx}`}>
                    <Marker position={route.originCoords}><Popup>{route.origin}</Popup></Marker>
                    <Marker position={route.destinationCoords}><Popup>{route.destination}</Popup></Marker>
                  </div>
                ))}
              </MapContainer>
            )
          })() : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Cargando mapa...</div>}
        </div>
      </div>

      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'24px'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editingId !== null ? 'Editar ruta' : 'Nueva ruta'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Origen *</label>
                  <select value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.origin ? 'border-red-400' : 'border-gray-200'}`}>
                    {cityNames.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Destino *</label>
                  <select value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.destination ? 'border-red-400' : 'border-gray-200'}`}>
                    {cityNames.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                </div>
              </div>

              {form.origin && form.destination && form.origin !== form.destination && cities[form.origin] && cities[form.destination] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                  <MapPin size={12} />
                  <span>Distancia calculada: <strong>{calcDistance(cities[form.origin], cities[form.destination])} km</strong> · Duración estimada: <strong>{formatDuration(calcEstimatedDuration(calcDistance(cities[form.origin], cities[form.destination])))}</strong></span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha y hora de salida *</label>
                <input type="datetime-local" value={form.departure} onChange={e => setForm({...form, departure: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.departure ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.departure && <p className="text-xs text-red-500 mt-1">{errors.departure}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Duración estimada (h)</label>
                  <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="Auto" min="0" step="0.25" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Duración real (h)</label>
                  <input type="number" value={form.actualDuration} onChange={e => setForm({...form, actualDuration: e.target.value})} placeholder="Al completar" min="0" step="0.25"
                    className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${form.status !== 'completed' ? 'opacity-50' : ''}`}
                    disabled={form.status !== 'completed'}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Estado</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En curso</option>
                  <option value="completed">Completada</option>
                </select>
                {form.status === 'completed' && <p className="text-xs text-blue-600 mt-1">Introduce la duración real para calcular la puntualidad</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Conductor</label>
                <select value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sin asignar</option>
                  {drivers.filter(d => d.status === 'available').map(d => <option key={d.id} value={d.id}>{d.name} ({d.license})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Vehículo</label>
                <select value={form.truckId} onChange={e => setForm({...form, truckId: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sin asignar</option>
                  {trucks.filter(t => t.status === 'available').map(t => <option key={t.id} value={t.id}>{t.plate} - {t.brand} {t.type}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Carga</label>
                <select value={form.cargoId} onChange={e => setForm({...form, cargoId: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sin asignar</option>
                  {cargo.filter(c => c.status !== 'delivered').map(c => <option key={c.id} value={c.id}>{c.type} - {c.client} ({(c.weight/1000).toFixed(1)}T)</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={handleClose} className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all">Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all">{editingId !== null ? 'Guardar cambios' : 'Crear ruta'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar ruta"
          message={`¿Estás seguro de que quieres eliminar la ruta ${confirmDelete.origin} → ${confirmDelete.destination}?`}
          onConfirm={() => { setRoutes(prev => prev.filter(r => r.id !== confirmDelete.id)); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
