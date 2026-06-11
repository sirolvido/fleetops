import { useState, useEffect } from 'react'
import { MapPin, Clock, Truck, User } from 'lucide-react'
import { routes, drivers, trucks } from '../data/mockData'

const statusConfig = {
  'pending':     { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  'in-progress': { label: 'En curso',    color: 'bg-blue-100 text-blue-700' },
  'completed':   { label: 'Completada',  color: 'bg-green-100 text-green-700' },
}

export default function Routes() {
  const [selected, setSelected] = useState(null)
  const [MapComponents, setMapComponents] = useState(null)

  useEffect(() => {
    // Carga dinámica de Leaflet para evitar SSR issues
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl]) => {
      setMapComponents(rl)
    })
  }, [])

  const getDriver = (id) => drivers.find(d => d.id === id)
  const getTruck = (id) => trucks.find(t => t.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rutas</h1>
          <p className="text-gray-500 text-sm mt-1">{routes.length} rutas registradas</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Nueva ruta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Lista de rutas */}
        <div className="space-y-3">
          {routes.map(route => {
            const status = statusConfig[route.status]
            const driver = getDriver(route.driver)
            const truck = getTruck(route.truck)
            const isSelected = selected?.id === route.id

            return (
              <div
                key={route.id}
                onClick={() => setSelected(route)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-800">
                      {route.origin} → {route.destination}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {route.estimatedTime}
                  </span>
                  <span>{route.distance} km</span>
                  <span>Salida: {route.departure.split(' ')[1]}</span>
                </div>

                {route.status === 'in-progress' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progreso</span>
                      <span>{route.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${route.progress}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {driver ? (
                    <span className="flex items-center gap-1">
                      <User size={11} /> {driver.name}
                    </span>
                  ) : (
                    <span className="text-orange-500">Sin conductor asignado</span>
                  )}
                  {truck && (
                    <span className="flex items-center gap-1">
                      <Truck size={11} /> {truck.plate}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
          {MapComponents ? (
            (() => {
              const { MapContainer, TileLayer, Marker, Popup, Polyline } = MapComponents
              const L = window.L

              return (
                <MapContainer
                  center={[40.4168, -3.7038]}
                  zoom={6}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {routes.map(route => (
                    <Polyline
                      key={route.id}
                      positions={[route.originCoords, route.destinationCoords]}
                      color={
                        route.status === 'in-progress' ? '#3b82f6' :
                        route.status === 'completed' ? '#10b981' : '#f59e0b'
                      }
                      weight={route.id === selected?.id ? 4 : 2}
                      opacity={route.id === selected?.id ? 1 : 0.5}
                    />
                  ))}
                  {routes.map(route => (
                    <>
                      <Marker key={`o-${route.id}`} position={route.originCoords}>
                        <Popup>{route.origin}</Popup>
                      </Marker>
                      <Marker key={`d-${route.id}`} position={route.destinationCoords}>
                        <Popup>{route.destination}</Popup>
                      </Marker>
                    </>
                  ))}
                </MapContainer>
              )
            })()
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Cargando mapa...
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
