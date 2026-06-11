import { Truck, Users, MapPin, Package, LayoutDashboard, Settings, LogOut } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'drivers',   label: 'Conductores', icon: Users },
  { id: 'trucks',    label: 'Camiones',    icon: Truck },
  { id: 'routes',    label: 'Rutas',       icon: MapPin },
  { id: 'cargo',     label: 'Cargas',      icon: Package },
]

export default function Sidebar({ activeSection, setActiveSection }) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Truck size={20} />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">FleetOps</div>
            <div className="text-xs text-gray-400 mt-0.5">Panel de control</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
          <Settings size={18} />
          Configuración
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
          <LogOut size={18} />
          Cerrar sesión
        </button>
        <div className="px-3 py-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">A</div>
            <div>
              <div className="text-xs font-medium">Admin</div>
              <div className="text-xs text-gray-500">Superadmin</div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  )
}
