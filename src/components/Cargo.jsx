import { useState } from 'react'
import { Package, Search, X, Pencil, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ConfirmModal from './ConfirmModal'

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

const emptyForm = {
  type: '', weight: '', origin: 'Madrid', destination: 'Barcelona',
  status: 'pending', priority: 'medium', client: '', deadline: '',
}

export default function Cargo() {
  const { cargo, setCargo, cities } = useApp()
  const cityNames = Object.keys(cities)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = cargo.filter(c =>
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    c.client.toLowerCase().includes(search.toLowerCase()) ||
    c.origin.toLowerCase().includes(search.toLowerCase()) ||
    c.destination.toLowerCase().includes(search.toLowerCase())
  )

  const validate = () => {
    const newErrors = {}
    if (!form.type.trim()) newErrors.type = 'El tipo de carga es obligatorio'
    if (!form.client.trim()) newErrors.client = 'El cliente es obligatorio'
    if (!form.weight || form.weight <= 0) newErrors.weight = 'Introduce el peso en kg'
    if (form.origin === form.destination) newErrors.destination = 'Origen y destino no pueden ser iguales'
    if (!form.deadline) newErrors.deadline = 'Introduce la fecha de entrega'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    if (editingId !== null) {
      setCargo(prev => prev.map(c => c.id === editingId ? { ...c, ...form, weight: parseInt(form.weight) } : c))
    } else {
      setCargo(prev => [...prev, { ...form, id: cargo.length + 1, weight: parseInt(form.weight) }])
    }
    handleClose()
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    setForm({ type: item.type, weight: item.weight, origin: item.origin, destination: item.destination, status: item.status, priority: item.priority, client: item.client, deadline: item.deadline })
    setShowModal(true)
  }

  const handleClose = () => { setShowModal(false); setEditingId(null); setForm(emptyForm); setErrors({}) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cargas</h1>
          <p className="text-gray-500 text-sm mt-1">{cargo.length} cargas registradas</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all">
          + Nueva carga
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por tipo, cliente, origen o destino..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

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
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3"></th>
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
                  <td className="px-5 py-4"><span className={`text-xs font-medium px-2 py-1 rounded-full ${priority.color}`}>{priority.label}</span></td>
                  <td className="px-5 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>{status.label}</span></td>
                  <td className="px-5 py-4 text-sm text-gray-600">{item.deadline}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Editar"><Pencil size={15} /></button>
                      <button onClick={() => setConfirmDelete(item)} className="text-gray-400 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'24px'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-gray-800">{editingId !== null ? 'Editar carga' : 'Nueva carga'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo de carga *</label>
                <input type="text" value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="Ej: Electrónica, Alimentación..." className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Cliente *</label>
                <input type="text" value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="Ej: TechCorp SA" className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.client ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Origen *</label>
                  <select value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {cityNames.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Destino *</label>
                  <select value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.destination ? 'border-red-400' : 'border-gray-200'}`}>
                    {cityNames.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Peso (kg) *</label>
                  <input type="number" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} placeholder="Ej: 8500" min="0" className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.weight ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fecha de entrega *</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deadline ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="pending">Pendiente</option>
                    <option value="in-transit">En tránsito</option>
                    <option value="delivered">Entregado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
              <button onClick={handleClose} className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all">Cancelar</button>
              <button onClick={handleSubmit} className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all">{editingId !== null ? 'Guardar cambios' : 'Crear carga'}</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Eliminar carga"
          message={`¿Estás seguro de que quieres eliminar la carga de ${confirmDelete.type} para ${confirmDelete.client}?`}
          onConfirm={() => { setCargo(prev => prev.filter(c => c.id !== confirmDelete.id)); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
