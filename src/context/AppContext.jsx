import { createContext, useContext, useState, useMemo } from 'react'
import {
  drivers as initialDrivers,
  trucks as initialTrucks,
  cargo as initialCargo,
  routes as initialRoutes,
} from '../data/mockData'

const initialCities = {
  'Madrid':     [40.4168, -3.7038],
  'Barcelona':  [41.3851, 2.1734],
  'Valencia':   [39.4699, -0.3763],
  'Sevilla':    [37.3891, -5.9845],
  'Bilbao':     [43.2627, -2.9253],
  'Zaragoza':   [41.6488, -0.8891],
  'Malaga':     [36.7213, -4.4213],
  'Murcia':     [37.9922, -1.1307],
  'Alicante':   [38.3452, -0.4810],
  'Valladolid': [41.6523, -4.7245],
}

const AVG_SPEED_KMH = 80 // Velocidad media de camión en autopista

// Fórmula Haversine para calcular distancia entre dos coordenadas
export function calcDistance(coord1, coord2) {
  const R = 6371
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

// Calcular duración estimada en horas a partir de la distancia
export function calcEstimatedDuration(distanceKm) {
  return Math.round((distanceKm / AVG_SPEED_KMH) * 4) / 4 // Redondeo a 0.25h
}

export function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [trucks, setTrucks] = useState(initialTrucks)
  const [cargo, setCargo] = useState(initialCargo)
  const [routes, setRoutes] = useState(initialRoutes)
  const [cities, setCities] = useState(initialCities)

  // Calcular horas semanales de cada conductor dinámicamente
  const driversWithHours = useMemo(() => {
    return drivers.map(driver => {
      const driverRoutes = routes.filter(r =>
        r.driver === driver.id &&
        r.status !== 'completed' &&
        r.duration
      )
      const calculatedHours = driverRoutes.reduce((sum, r) => sum + (r.duration || 0), 0)
      return {
        ...driver,
        hoursThisWeek: Math.round(calculatedHours * 10) / 10
      }
    })
  }, [drivers, routes])

  // Calcular KPIs dinámicamente
  const kpis = useMemo(() => {
    const completed = routes.filter(r => r.status === 'completed' && r.actualDuration && r.duration)
    const onTime = completed.filter(r => r.actualDuration <= r.duration * 1.1) // 10% margen
    const onTimeRate = completed.length > 0 ? Math.round((onTime.length / completed.length) * 100) : 94
    const availableDrivers = driversWithHours.filter(d => d.status === 'available').length
    const availableTrucks = trucks.filter(t => t.status === 'available').length
    const fleetEfficiency = trucks.length > 0
      ? Math.round(((trucks.length - trucks.filter(t => t.status === 'maintenance').length) / trucks.length) * 100)
      : 87

    return {
      onTimeDeliveryRate: onTimeRate,
      fuelEfficiency: fleetEfficiency,
      availableDrivers,
      availableTrucks,
      totalDrivers: drivers.length,
      totalTrucks: trucks.length,
      activeRoutes: routes.filter(r => r.status === 'in-progress').length,
      pendingRoutes: routes.filter(r => r.status === 'pending').length,
      completedRoutesThisMonth: routes.filter(r => r.status === 'completed').length,
      totalCargoThisMonth: cargo.reduce((sum, c) => sum + c.weight, 0),
    }
  }, [routes, drivers, trucks, cargo, driversWithHours])

  const addCity = (name, lat, lng) => {
    setCities(prev => ({ ...prev, [name]: [parseFloat(lat), parseFloat(lng)] }))
  }

  const removeCity = (name) => {
    setCities(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  return (
    <AppContext.Provider value={{
      drivers: driversWithHours,
      setDrivers,
      trucks, setTrucks,
      cargo, setCargo,
      routes, setRoutes,
      cities, addCity, removeCity,
      kpis,
      calcDistance,
      calcEstimatedDuration,
      formatDuration,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
