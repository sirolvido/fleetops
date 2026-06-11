import { useState } from 'react'
import { Truck, Search, Wrench, CheckCircle, AlertCircle } from 'lucide-react'
import { trucks } from '../data/mockData'

const statusConfig = {
  'available':    { label: 'Disponible',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'on-route':     { label: 'En ruta',       color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'maintenance':  { label: 'Mantenimiento', color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

export default function Trucks() {
  const [search, setSearch] = useState('')

  const filtered = trucks.filter(t =>
    t.plate.toLowerCase().includes(search.toLowerCase()) ||
    t.brand.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Camiones</h1>
          <p className="text-gray-500 text-sm mt-1">{trucks.length} vehículos en flota</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Añadir vehículo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {trucks.filter(t => t.status === key).length}
            </div>
          </div>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por matrícula, marca o tipo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Grid de camiones */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(truck => {
          const status = statusConfig[truck.status]
          return (
            <div key={truck.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Truck size={20} className="text-gray-600" />
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                  {status.label}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <div className="font-bold text-gray-800">{truck.plate}</div>
                <div className="text-sm text-gray-500">{truck.brand} · {truck.type} · {truck.year}</div>
              </div>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Capacidad</span>
                  <span className="font-medium text-gray-700">{(truck.capacity/1000).toFixed(0)}T</span>
                </div>
                <div className="flex justify-between">
                  <span>Kilometraje</span>
                  <span className="font-medium text-gray-700">{truck.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Últ. mantenimiento</span>
                  <span className="font-medium text-gray-700">{truck.lastMaintenance}</span>
                </div>
              </div>

              {truck.status === 'maintenance' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded-lg">
                  <Wrench size={12} />
                  En mantenimiento
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
