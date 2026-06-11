import { useState } from 'react'
import { Package, Search, AlertCircle } from 'lucide-react'
import { cargo } from '../data/mockData'

const statusConfig = {
  'pending':    { label: 'Pendiente',    color: 'bg-yellow-100 text-yellow-700' },
  'in-transit': { label: 'En tránsito',  color: 'bg-blue-100 text-blue-700' },
  'delivered':  { label: 'Entregado',    color: 'bg-green-100 text-green-700' },
}

const priorityConfig = {
  'high':   { label: 'Alta',   color: 'text-red-600 bg-red-50' },
  'medium': { label: 'Media',  color: 'text-orange-600 bg-orange-50' },
  'low':    { label: 'Baja',   color: 'text-gray-600 bg-gray-100' },
}

export default function Cargo() {
  const [search, setSearch] = useState('')

  const filtered = cargo.filter(c =>
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.client.toLowerCase().includes(search.toLowerCase()) ||
    c.origin.toLowerCase().includes(search.toLowerCase()) ||
    c.destination.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cargas</h1>
          <p className="text-gray-500 text-sm mt-1">{cargo.length} cargas registradas</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Nueva carga
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por tipo, cliente, origen o destino..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Tipo</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Cliente</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Ruta</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Peso</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Prioridad</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Estado</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(item => {
              const status = statusConfig[item.status]
              const priority = priorityConfig[item.priority]
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package size={14} className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.client}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-700">{item.origin}</div>
                    <div className="text-xs text-gray-400">→ {item.destination}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{(item.weight/1000).toFixed(1)}T</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${priority.color}`}>
                      {priority.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.deadline}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
