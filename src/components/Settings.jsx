import { useState } from 'react'
import { MapPin, Plus, Trash2, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { cities, addCity, removeCity } = useApp()
  const [form, setForm] = useState({ name: '', lat: '', lng: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio'
    if (cities[form.name]) newErrors.name = 'Esta ciudad ya existe'
    if (!form.lat || isNaN(form.lat) || form.lat < -90 || form.lat > 90)
      newErrors.lat = 'Latitud inválida (-90 a 90)'
    if (!form.lng || isNaN(form.lng) || form.lng < -180 || form.lng > 180)
      newErrors.lng = 'Longitud inválida (-180 a 180)'
    return newErrors
  }

  const handleAdd = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    addCity(form.name.trim(), form.lat, form.lng)
    setForm({ name: '', lat: '', lng: '' })
    setErrors({})
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleRemove = (name) => {
    if (window.confirm(`¿Eliminar la ciudad "${name}"?`)) {
      removeCity(name)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona las ciudades disponibles para rutas y cargas</p>
      </div>

      {/* Sección ciudades */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <MapPin size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-800">Ciudades</div>
            <div className="text-xs text-gray-500">{Object.keys(cities).length} ciudades registradas</div>
          </div>
        </div>

        {/* Formulario añadir ciudad */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
          <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Añadir nueva ciudad</div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ej: Pamplona"
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Latitud *</label>
              <input
                type="number"
                value={form.lat}
                onChange={e => setForm({...form, lat: e.target.value})}
                placeholder="Ej: 42.8169"
                step="0.0001"
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.lat ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.lat && <p className="text-xs text-red-500 mt-1">{errors.lat}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Longitud *</label>
              <input
                type="number"
                value={form.lng}
                onChange={e => setForm({...form, lng: e.target.value})}
                placeholder="Ej: -1.6432"
                step="0.0001"
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.lng ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.lng && <p className="text-xs text-red-500 mt-1">{errors.lng}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              <Plus size={15} />
              Añadir ciudad
            </button>
            {success && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Ciudad añadida correctamente
              </span>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span>Puedes obtener las coordenadas en <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Maps</a> haciendo clic derecho sobre la ciudad.</span>
          </div>
        </div>

        {/* Lista de ciudades */}
        <div className="divide-y divide-gray-50">
          {Object.entries(cities).map(([name, coords]) => (
            <div key={name} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin size={13} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{name}</div>
                  <div className="text-xs text-gray-400">
                    {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(name)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Eliminar ciudad"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
