import { useState } from 'react'
import { Truck, Search, Wrench, X, Pencil } from 'lucide-react'
import { trucks as initialTrucks } from '../data/mockData'

const statusConfig = {
  'available':    { label: 'Disponible',    color: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  'on-route':     { label: 'En ruta',       color: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500' },
  'maintenance':  { label: 'Mantenimiento', color: 'bg-red-100 text-red-700',      dot: 'bg-red-500' },
}

const emptyForm = {
  plate: '',
  type: 'Tráiler',
  capacity: '',
  brand: '',
  year: new Date().getFullYear(),
  status: 'available',
  lastMaintenance: '',
  mileage: '',
}

export default function Trucks() {
  const [trucks, setTrucks] = useState(initialTrucks)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const filtered = trucks.filter(t =>
    t.plate.toLowerCase().includes(search.toLowerCase()) ||
    t.brand.toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  const validate = () => {
    const newErrors = {}
    if (!form.plate.trim()) newErrors.plate = 'La matrícula es obligatoria'
    if (!form.brand.trim()) newErrors.brand = 'La marca es obligatoria'
    if (!form.capacity || form.capacity <= 0) newErrors.capacity = 'Introduce la capacidad en kg'
    if (!form.mileage && form.mileage !== 0) newErrors.mileage = 'Introduce el kilometraje'
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (editingId !== null) {
      setTrucks(prev => prev.map(t =>
        t.id === editingId
          ? { ...t, ...form, capacity: parseInt(form.capacity), mileage: parseInt(form.mileage), year: parseInt(form.year) }
          : t
      ))
    } else {
      const newTruck = {
        ...form,
        id: trucks.length + 1,
        capacity: parseInt(form.capacity),
        mileage: parseInt(form.mileage),
        year: parseInt(form.year),
      }
      setTrucks(prev => [...prev, newTruck])
    }

    handleClose()
  }

  const handleEdit = (truck) => {
    setEditingId(truck.id)
    setForm({
      plate: truck.plate,
      type: truck.type,
      capacity: truck.capacity,
      brand: truck.brand,
      year: truck.year,
      status: truck.status,
      lastMaintenance: truck.lastMaintenance,
      mileage: truck.mileage,
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
          <h1 className="text-2xl font-bold text-gray-800">Vehículos</h1>
          <p className="text-gray-500 text-sm mt-1">{trucks.length} vehículos en flota</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
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

      {/* Grid de vehículos */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(truck => {
          const status = statusConfig[truck.status]
          return (
            <div key={truck.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Truck size={20} className="text-gray-600" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                  </span>
                  <button
                    onClick={() => handleEdit(truck)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar vehículo"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
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

      {/* Modal añadir / editar vehículo */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'24px'}}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId !== null ? 'Editar vehículo' : 'Añadir vehículo'}
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Matrícula *</label>
                  <input
                    type="text"
                    value={form.plate}
                    onChange={e => setForm({...form, plate: e.target.value})}
                    placeholder="Ej: 1234-ABC"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.plate ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.plate && <p className="text-xs text-red-500 mt-1">{errors.plate}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Marca *</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => setForm({...form, brand: e.target.value})}
                    placeholder="Ej: Volvo"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.brand ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Tipo *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tráiler">Tráiler</option>
                    <option value="Rígido">Rígido</option>
                    <option value="Frigorífico">Frigorífico</option>
                    <option value="Cisterna">Cisterna</option>
                    <option value="Volquete">Volquete</option>
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
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Capacidad (kg) *</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={e => setForm({...form, capacity: e.target.value})}
                    placeholder="Ej: 24000"
                    min="0"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.capacity ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Año *</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={e => setForm({...form, year: e.target.value})}
                    placeholder="Ej: 2022"
                    min="1990"
                    max="2026"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Kilometraje *</label>
                  <input
                    type="number"
                    value={form.mileage}
                    onChange={e => setForm({...form, mileage: e.target.value})}
                    placeholder="Ej: 85000"
                    min="0"
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mileage ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.mileage && <p className="text-xs text-red-500 mt-1">{errors.mileage}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Últ. mantenimiento</label>
                  <input
                    type="date"
                    value={form.lastMaintenance}
                    onChange={e => setForm({...form, lastMaintenance: e.target.value})}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                {editingId !== null ? 'Guardar cambios' : 'Añadir vehículo'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
