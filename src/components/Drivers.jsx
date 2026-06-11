import { useState } from 'react'
import { Users, Phone, Clock, Search, AlertCircle, X, Pencil } from 'lucide-react'
import { drivers as initialDrivers } from '../data/mockData'

const statusConfig = {
  'available':  { label: 'Disponible',  color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'on-route':   { label: 'En ruta',     color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'off-duty':   { label: 'Descanso',    color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  'on-leave':   { label: 'Vacaciones',  color: 'bg-orange-100 text-orange-700',dot: 'bg-orange-500' },
}

const emptyForm = {
  name: '',
  license: 'C',
  status: 'available',
  phone: '',
  experience: '',
  hoursThisWeek: 0,
  assignedTruck: null,
}

export default function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const filtered = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || d.status === filter
    return matchSearch && matchFilter
  })

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!form.phone.trim()) newErrors.phone = 'El teléfono es obligatorio'
    if (!form.experience || form.experience < 0) newErrors.experience = 'Introduce años de experiencia'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (editingId !== null) {
      // Editar conductor existente
      setDrivers(prev => prev.map(d =>
        d.id === editingId
          ? { ...d, ...form, experience: parseInt(form.experience) }
          : d
      ))
    } else {
      // Añadir nuevo conductor
      const newDriver = {
        ...form,
        id: drivers.length + 1,
        experience: parseInt(form.experience),
      }
      setDrivers(prev => [...prev, newDriver])
    }

    handleClose()
  }

  const handleEdit = (driver) => {
    setEditingId(driver.id)
    setForm({
      name: driver.name,
      license: driver.license,
      status: driver.status,
      phone: driver.phone,
      experience: driver.experience,
      hoursThisWeek: driver.hoursThisWeek,
      assignedTruck: driver.assignedTruck,
    })
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Conductores</h1>
          <p className="text-gray-500 text-sm mt-1">{drivers.length} conductores registrados</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
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
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3"></th>
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
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar conductor"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal añadir / editar conductor */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'24px'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId !== null ? 'Editar conductor' : 'Añadir conductor'}
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre completo *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Ej: Juan García López"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Licencia *</label>
                  <select
                    value={form.license}
                    onChange={e => setForm({...form, license: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="C">C</option>
                    <option value="C+E">C+E</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Estado *</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Disponible</option>
                    <option value="on-route">En ruta</option>
                    <option value="off-duty">Descanso</option>
                    <option value="on-leave">Vacaciones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Teléfono *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+34 612 345 678"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Años de experiencia *</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={e => setForm({...form, experience: e.target.value})}
                  placeholder="Ej: 5"
                  min="0"
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.experience ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
              </div>

            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={handleClose}
                className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
              >
                {editingId !== null ? 'Guardar cambios' : 'Añadir conductor'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
