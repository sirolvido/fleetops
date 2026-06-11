import { useState } from 'react'
import { Bell, X, AlertTriangle, Clock, Wrench, MapPin, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header({ activeSection }) {

  const { drivers, routes, trucks } = useApp()
  const [open, setOpen] = useState(false)

  const sectionTitles = {
    dashboard:  'Dashboard',
    drivers:    'Conductores',
    trucks:     'Vehículos',
    routes:     'Rutas',
    cargo:      'Cargas',
    settings:   'Configuración',
  }

  // Generar alertas dinámicamente
  const alerts = []

  // Conductores con exceso de horas (>45h)
  drivers.filter(d => d.hoursThisWeek >= 45).forEach(d => {
    alerts.push({
      id: `driver-hours-${d.id}`,
      type: 'critical',
      icon: Clock,
      title: 'Exceso de horas',
      message: `${d.name} lleva ${d.hoursThisWeek}h esta semana (límite: 45h)`,
      color: 'text-red-600 bg-red-50 border-red-200',
      iconColor: 'text-red-500',
    })
  })

  // Rutas con retraso
  routes.filter(r => r.status === 'completed' && r.actualDuration && r.duration && r.actualDuration > r.duration * 1.1).forEach(r => {
    alerts.push({
      id: `route-late-${r.id}`,
      type: 'warning',
      icon: MapPin,
      title: 'Ruta con retraso',
      message: `${r.origin} → ${r.destination}: ${r.actualDuration}h reales vs ${r.duration}h estimadas`,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      iconColor: 'text-orange-500',
    })
  })

  // Vehículos en mantenimiento
  trucks.filter(t => t.status === 'maintenance').forEach(t => {
    alerts.push({
      id: `truck-maintenance-${t.id}`,
      type: 'warning',
      icon: Wrench,
      title: 'Vehículo en mantenimiento',
      message: `${t.plate} (${t.brand} ${t.type}) no está disponible`,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-500',
    })
  })

  // Rutas pendientes sin asignar
  routes.filter(r => r.status === 'pending' && (!r.driver || !r.truck)).forEach(r => {
    alerts.push({
      id: `route-unassigned-${r.id}`,
      type: 'info',
      icon: AlertTriangle,
      title: 'Ruta sin asignar',
      message: `${r.origin} → ${r.destination}: ${!r.driver ? 'sin conductor' : ''}${!r.driver && !r.truck ? ' y ' : ''}${!r.truck ? 'sin vehículo' : ''}`,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
    })
  })

  const criticalAlerts = alerts.filter(a => a.type === 'critical')
  const hasCritical = criticalAlerts.length > 0

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {sectionTitles[activeSection] || 'FleetOps'}
        </h2>

        <div className="flex items-center gap-4">

          {/* Campana de notificaciones */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} className={hasCritical ? 'text-red-500' : 'text-gray-500'} />
              {alerts.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center ${hasCritical ? 'bg-red-500' : 'bg-blue-500'}`}>
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {open && (
              <div className="absolute right-0 top-11 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-gray-800 text-sm">Notificaciones</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{alerts.length} alertas activas</span>
                    <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-30" />
                      Todo en orden, no hay alertas
                    </div>
                  ) : (
                    alerts.map(alert => {
                      const Icon = alert.icon
                      return (
                        <div key={alert.id} className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.color.split(' ').slice(1).join(' ')}`}>
                            <Icon size={15} className={alert.iconColor} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-700">{alert.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{alert.message}</div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Usuario */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <div className="hidden sm:block">
              <div className="text-xs font-medium text-gray-800">Admin</div>
              <div className="text-xs text-gray-400">Superadmin</div>
            </div>
          </div>
        </div>
      </header>

      {/* Banner crítico */}
      {hasCritical && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-700 font-medium">
            {criticalAlerts.length === 1
              ? criticalAlerts[0].message
              : `${criticalAlerts.length} conductores han superado el límite de horas semanales`
            }
          </span>
        </div>
      )}
    </>
  )
}
