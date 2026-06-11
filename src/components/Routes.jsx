import { useState, useEffect } from 'react'
import { MapPin, Clock, Truck, User, X, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmModal from './ConfirmModal'

const statusConfig = {
  'pending':     { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  'in-progress': { label: 'En curso',    color: 'bg-blue-100 text-blue-700' },
  'completed':   { label: 'Completada',  color: 'bg-green-100 text-green-700' },
}

const emptyForm = {
  origin: 'Madrid', destination: 'Barcelona',
  driverId: '', truckId: '', cargoId: '', departure: '', status: 'pending',
}

export default function Routes() {
  const { routes, setRoutes, drivers, trucks, cargo, cities } = useApp()
  const [selected, setSelected] = useState(null)
  const [MapComponents, setMapComponents] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const cityNames = Object.keys(cities)

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl]) => setMapComponents(rl))
  }, [])

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

    if (editingId !== null) {
      setRoutes(prev => prev.map(r => r.id === editingId ? {
        ...r, origin: form.origin, destination: form.destination,
        originCoords, destinationCoords,
        driver: form.driverId ? parseInt(form.driverId) : null,
        truck: form.truckId ? parseInt(form.truckId) : null,
        cargo: form.cargoId ? parseInt(form.cargoId) : null,
        departure: form.departure, status: form.status,
      } : r))
    } else {
      setRoutes(prev => [...prev, {
        id: routes.length + 1, origin: form.origin, destination: form.destination,
        originCoords, destinationCoords,
        driver: form.driverId ? parseInt(form.driverId) : null,
        truck: form.truckId ? parseInt(form.truckId) : null,
        cargo: form.cargoId ? parseInt(form.cargoId) : null,
        status: form.status, distance: Math.floor(Math.random() * 600 + 200),
        estimatedTime: '5h 00min', departure: form.departure, arrival: '', progress: 0,
      }])
    }
    handleClose()
  }

  const handleEdit = (route) => {
    setEditingId(route.id)
    setForm({ origin: route.origin, destination: route.destination, driverId: route.driver || '', truckId: route.truck || '', cargoId: route.cargo || '', departure: route.departure, status: route.status })
    setShowModal(true)
  }

  const handleClose = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setErrors({}) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
          <p className="text-gray-500 text-sm mt-1">{routes.length} rutas registradas</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Nueva ruta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {routes.map(route => {
            const status = statusConfig[route.status]
            const driver = getDriver(route.driver)
            const truck = getTruck(route.truck)
            const isSelected = selected?.id === route.id
            return (
              <div key={route.id} onClick={() => setSelected(route)} className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-800">{route.origin} → {route.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
                    <button onClick={e => { e.stopPropagation(); handleEdit(route) }} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={14} /></button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(route) }} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={11} /> {route.estimatedTime}</span>
                  <span>{route.distance} km</span>
                  <span>Salida: {route.departure?.split('T')[1] || route.departure?.split(' ')[1] || route.departure}</span>
                </div>
                {route.status === 'in-progress' && (
                  <div className="mb-3">
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
                {routes.map(route => (
                  <>
                    <Marker key={`o-${route.id}`} position={route.originCoords}><Popup>{route.origin}</Popup></Marker>
                    <Marker key={`d-${route.id}`} position={route.destinationCoords}><Popup>{route.destination}</Popup></Marker>
                  </>
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
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha y hora de salida *</label>
                <input type="datetime-local" value={form.departure} onChange={e => setForm({...form, departure: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.departure ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.departure && <p className="text-xs text-red-500 mt-1">{errors.departure}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Estado</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En curso</option>
                  <option value="completed">Completada</option>
                </select>
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
