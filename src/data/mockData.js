// ============================================================
// FleetOps — Mock Data
// Datos simulados para la demo
// ============================================================

export const drivers = [
  { id: 1, name: 'Carlos Martínez', license: 'C+E', status: 'available', phone: '+34 612 345 678', experience: 8, assignedTruck: null, hoursThisWeek: 32 },
  { id: 2, name: 'Pedro Sánchez', license: 'C', status: 'on-route', phone: '+34 623 456 789', experience: 5, assignedTruck: 3, hoursThisWeek: 40 },
  { id: 3, name: 'Miguel Torres', license: 'C+E', status: 'available', phone: '+34 634 567 890', experience: 12, assignedTruck: null, hoursThisWeek: 28 },
  { id: 4, name: 'Antonio López', license: 'C', status: 'off-duty', phone: '+34 645 678 901', experience: 3, assignedTruck: null, hoursThisWeek: 0 },
  { id: 5, name: 'Juan García', license: 'C+E', status: 'on-route', phone: '+34 656 789 012', experience: 7, assignedTruck: 1, hoursThisWeek: 45 },
  { id: 6, name: 'Francisco Ruiz', license: 'C', status: 'available', phone: '+34 667 890 123', experience: 6, assignedTruck: null, hoursThisWeek: 35 },
  { id: 7, name: 'Manuel Díaz', license: 'C+E', status: 'on-leave', phone: '+34 678 901 234', experience: 10, assignedTruck: null, hoursThisWeek: 0 },
  { id: 8, name: 'José Moreno', license: 'C', status: 'available', phone: '+34 689 012 345', experience: 4, assignedTruck: null, hoursThisWeek: 22 },
];

export const trucks = [
  { id: 1, plate: '1234-ABC', type: 'Tráiler', capacity: 24000, status: 'on-route', brand: 'Volvo', year: 2021, lastMaintenance: '2026-04-15', mileage: 145000 },
  { id: 2, plate: '5678-DEF', type: 'Rígido', capacity: 12000, status: 'available', brand: 'Mercedes', year: 2020, lastMaintenance: '2026-05-01', mileage: 98000 },
  { id: 3, plate: '9012-GHI', type: 'Tráiler', capacity: 24000, status: 'on-route', brand: 'Scania', year: 2022, lastMaintenance: '2026-03-20', mileage: 67000 },
  { id: 4, plate: '3456-JKL', type: 'Frigorífico', capacity: 18000, status: 'maintenance', brand: 'DAF', year: 2019, lastMaintenance: '2026-06-01', mileage: 210000 },
  { id: 5, plate: '7890-MNO', type: 'Tráiler', capacity: 24000, status: 'available', brand: 'MAN', year: 2023, lastMaintenance: '2026-05-15', mileage: 32000 },
  { id: 6, plate: '2345-PQR', type: 'Cisterna', capacity: 20000, status: 'available', brand: 'Iveco', year: 2021, lastMaintenance: '2026-04-28', mileage: 89000 },
];

export const cargo = [
  { id: 1, type: 'Electrónica', weight: 8500, origin: 'Madrid', destination: 'Barcelona', status: 'in-transit', priority: 'high', client: 'TechCorp SA', deadline: '2026-06-12' },
  { id: 2, type: 'Alimentación', weight: 15000, origin: 'Valencia', destination: 'Bilbao', status: 'pending', priority: 'medium', client: 'FoodLogistics SL', deadline: '2026-06-14' },
  { id: 3, type: 'Maquinaria', weight: 22000, origin: 'Sevilla', destination: 'Madrid', status: 'in-transit', priority: 'low', client: 'IndusMaq SA', deadline: '2026-06-15' },
  { id: 4, type: 'Farmacéutica', weight: 3200, origin: 'Barcelona', destination: 'Valencia', status: 'delivered', priority: 'high', client: 'PharmaEx SL', deadline: '2026-06-10' },
  { id: 5, type: 'Textil', weight: 6800, origin: 'Madrid', destination: 'Sevilla', status: 'pending', priority: 'low', client: 'ModaLogis SA', deadline: '2026-06-18' },
  { id: 6, type: 'Construcción', weight: 20000, origin: 'Zaragoza', destination: 'Madrid', status: 'pending', priority: 'medium', client: 'BuildMat SL', deadline: '2026-06-16' },
];

export const routes = [
  {
    id: 1,
    origin: 'Madrid',
    destination: 'Barcelona',
    originCoords: [40.4168, -3.7038],
    destinationCoords: [41.3851, 2.1734],
    driver: 5,
    truck: 1,
    cargo: 1,
    status: 'in-progress',
    distance: 621,
    estimatedTime: '6h 30min',
    departure: '2026-06-11 08:00',
    arrival: '2026-06-11 14:30',
    progress: 65,
  },
  {
    id: 2,
    origin: 'Sevilla',
    destination: 'Madrid',
    originCoords: [37.3891, -5.9845],
    destinationCoords: [40.4168, -3.7038],
    driver: 2,
    truck: 3,
    cargo: 3,
    status: 'in-progress',
    distance: 534,
    estimatedTime: '5h 45min',
    departure: '2026-06-11 09:00',
    arrival: '2026-06-11 14:45',
    progress: 40,
  },
  {
    id: 3,
    origin: 'Valencia',
    destination: 'Bilbao',
    originCoords: [39.4699, -0.3763],
    destinationCoords: [43.2627, -2.9253],
    driver: null,
    truck: null,
    cargo: 2,
    status: 'pending',
    distance: 615,
    estimatedTime: '6h 15min',
    departure: '2026-06-12 07:00',
    arrival: '2026-06-12 13:15',
    progress: 0,
  },
  {
    id: 4,
    origin: 'Madrid',
    destination: 'Sevilla',
    originCoords: [40.4168, -3.7038],
    destinationCoords: [37.3891, -5.9845],
    driver: null,
    truck: null,
    cargo: 5,
    status: 'pending',
    distance: 534,
    estimatedTime: '5h 30min',
    departure: '2026-06-13 08:00',
    arrival: '2026-06-13 13:30',
    progress: 0,
  },
  {
    id: 5,
    origin: 'Barcelona',
    destination: 'Valencia',
    originCoords: [41.3851, 2.1734],
    destinationCoords: [39.4699, -0.3763],
    driver: null,
    truck: null,
    cargo: 4,
    status: 'completed',
    distance: 349,
    estimatedTime: '3h 30min',
    departure: '2026-06-10 09:00',
    arrival: '2026-06-10 12:30',
    progress: 100,
  },
];

export const metrics = {
  totalDrivers: 8,
  availableDrivers: 4,
  totalTrucks: 6,
  availableTrucks: 3,
  activeRoutes: 2,
  pendingRoutes: 2,
  completedRoutesThisMonth: 18,
  totalCargoThisMonth: 245000,
  onTimeDeliveryRate: 94,
  fuelEfficiency: 87,
};

export const weeklyData = [
  { day: 'Lun', rutas: 4, entregas: 3, incidencias: 1 },
  { day: 'Mar', rutas: 6, entregas: 5, incidencias: 0 },
  { day: 'Mié', rutas: 5, entregas: 5, incidencias: 2 },
  { day: 'Jue', rutas: 7, entregas: 6, incidencias: 1 },
  { day: 'Vie', rutas: 8, entregas: 7, incidencias: 0 },
  { day: 'Sáb', rutas: 3, entregas: 3, incidencias: 0 },
  { day: 'Dom', rutas: 2, entregas: 2, incidencias: 0 },
];

export const monthlyData = [
  { month: 'Ene', km: 45000, carga: 180000 },
  { month: 'Feb', km: 38000, carga: 152000 },
  { month: 'Mar', km: 52000, carga: 208000 },
  { month: 'Abr', km: 48000, carga: 192000 },
  { month: 'May', km: 61000, carga: 244000 },
  { month: 'Jun', km: 35000, carga: 140000 },
];