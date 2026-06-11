import { Users, Truck, MapPin, Package, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { metrics, weeklyData, monthlyData, routes, drivers } from '../data/mockData'

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon size={20} className="text-white" />
      </div>
      <span className="text-xs text-gray-400 font-medium">Hoy</span>
    </div>
    <div className="text-2xl font-bold text-gray-800">{value}</div>
    <div className="text-sm text-gray-500 mt-0.5">{title}</div>
    {subtitle && <div className="text-xs text-green-500 mt-1">{subtitle}</div>}
  </div>
)

export default function Dashboard() {
  const activeRoutes = routes.filter(r => r.status === 'in-progress')
  const availableDrivers = drivers.filter(d => d.status === 'available')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen operativo en tiempo real</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Conductores disponibles" value={`${metrics.availableDrivers}/${metrics.totalDrivers}`} subtitle="↑ 2 desde ayer" icon={Users} color="bg-blue-500" />
        <StatCard title="Camiones disponibles" value={`${metrics.availableTrucks}/${metrics.totalTrucks}`} subtitle="1 en mantenimiento" icon={Truck} color="bg-green-500" />
        <StatCard title="Rutas activas" value={metrics.activeRoutes} subtitle={`${metrics.pendingRoutes} pendientes`} icon={MapPin} color="bg-orange-500" />
        <StatCard title="Entregas este mes" value={metrics.completedRoutesThisMonth} subtitle="↑ 94% a tiempo" icon={CheckCircle} color="bg-purple-500" />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm font-medium text-gray-600">Tasa de puntualidad</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{metrics.onTimeDeliveryRate}%</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.onTimeDeliveryRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Package size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Carga este mes</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{(metrics.totalCargoThisMonth / 1000).toFixed(0)}T</div>
          <div className="text-xs text-gray-400 mt-1">245.000 kg transportados</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Eficiencia flota</span>
          </div>
          <div className="text-3xl font-bold text-gray-800">{metrics.fuelEfficiency}%</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${metrics.fuelEfficiency}%` }}></div>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Actividad semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rutas" fill="#3b82f6" radius={[4,4,0,0]} name="Rutas" />
              <Bar dataKey="entregas" fill="#10b981" radius={[4,4,0,0]} name="Entregas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolución mensual (km)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Kilómetros" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rutas activas */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Rutas en curso</h3>
        <div className="space-y-3">
          {activeRoutes.map(route => (
            <div key={route.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{route.origin} → {route.destination}</div>
                <div className="text-xs text-gray-400">{route.distance} km · {route.estimatedTime}</div>
              </div>
              <div className="w-32">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso</span>
                  <span>{route.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${route.progress}%` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <Clock size={11} />
                {route.arrival.split(' ')[1]}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
