import { useState } from 'react'
import { Users, Phone, Clock, Search, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react'
import { drivers } from '../data/mockData'

const statusConfig = {
  'available':  { label: 'Disponible',  color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'on-route':   { label: 'En ruta',     color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'off-duty':   { label: 'Descanso',    color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  'on-leave':   { label: 'Vacaciones',  color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500' },
}

export default function Drivers() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || d.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Conductores</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} conductores registrados</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Añadir conductor
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {drivers.filter(d => d.status === key).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conductor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="available">Disponibles</option>
          <option value="on-route">En ruta</option>
          <option value="off-duty">Descanso</option>
          <option value="on-leave">Vacaciones</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Conductor</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Licencia</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Estado</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Horas semana</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Experiencia</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(driver => {
              const status = statusConfig[driver.status]
              return (
                <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {driver.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{driver.name}</div>
                        <div className="text-xs text-gray-400">ID #{driver.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded">{driver.license}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{driver.hoursThisWeek}h</span>
                      {driver.hoursThisWeek >= 45 && <AlertCircle size={13} className="text-orange-500" />}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-700">{driver.experience} años</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone size={12} />
                      {driver.phone}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
