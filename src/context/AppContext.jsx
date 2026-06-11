import { createContext, useContext, useState } from 'react'
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

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [trucks, setTrucks] = useState(initialTrucks)
  const [cargo, setCargo] = useState(initialCargo)
  const [routes, setRoutes] = useState(initialRoutes)
  const [cities, setCities] = useState(initialCities)

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
      drivers, setDrivers,
      trucks, setTrucks,
      cargo, setCargo,
      routes, setRoutes,
      cities, addCity, removeCity,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
