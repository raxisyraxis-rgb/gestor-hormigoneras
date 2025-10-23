import type { UserProfile, UserRole, TruckInventory, Booking, Schedule, TruckType } from '../types';

// --- MOCK DATABASE ---
let MOCK_USERS: UserProfile[] = [
  { uid: 'client1', email: 'cliente@test.com', name: 'Constructora XYZ', role: 'client', plants: ['Planta Norte', 'Planta Sur'] },
  { uid: 'worker1', email: 'trabajador@test.com', name: 'Juan Pérez', role: 'worker' },
  { uid: 'owner1', email: 'admin@test.com', name: 'Admin', role: 'owner' },
];

let MOCK_TRUCK_INVENTORY: TruckInventory = {
  threeAxle: 5,
  fourAxle: 3,
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().split('T')[0];

let MOCK_BOOKINGS: Booking[] = [
  { id: 'booking1', clientId: 'client1', clientName: 'Constructora XYZ', plant: 'Planta Norte', truckType: '3-ejes', bookingTime: `${tomorrowISO}T09:00:00.000Z`, status: 'pendiente' },
  { id: 'booking2', clientId: 'client1', clientName: 'Constructora XYZ', plant: 'Planta Sur', truckType: '4-ejes', bookingTime: `${tomorrowISO}T11:00:00.000Z`, status: 'confirmada', workerId: 'worker1', workerName: 'Juan Pérez' },
];

const MOCK_SCHEDULES: { [workerId: string]: Schedule } = {
  'worker1': {
    date: tomorrowISO,
    assignments: [
      { time: '11:00', clientName: 'Constructora XYZ', plant: 'Planta Sur', truckType: '4-ejes' }
    ]
  }
};
// --- END MOCK DATABASE ---

const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// --- AUTH ---
export const apiLogin = async (email: string, pass: string): Promise<UserProfile> => {
  console.log(`Intentando iniciar sesión con ${email}/${pass}`);
  const user = MOCK_USERS.find(u => u.email === email);
  if (user) {
    return simulateDelay(user);
  }
  throw new Error('Credenciales inválidas');
};

// --- CLIENT ---
export const getTruckInventory = async (): Promise<TruckInventory> => {
  return simulateDelay(MOCK_TRUCK_INVENTORY);
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'clientName'>): Promise<Booking> => {
  const client = MOCK_USERS.find(u => u.uid === bookingData.clientId);
  if (!client) throw new Error("Cliente no encontrado");
  
  const newBooking: Booking = {
    ...bookingData,
    id: `booking${Date.now()}`,
    status: 'pendiente',
    clientName: client.name,
  };
  MOCK_BOOKINGS.push(newBooking);

  // Reducir inventario
  if (newBooking.truckType === '3-ejes') {
    MOCK_TRUCK_INVENTORY.threeAxle -= 1;
  } else {
    MOCK_TRUCK_INVENTORY.fourAxle -= 1;
  }
  
  return simulateDelay(newBooking);
};

// --- WORKER ---
export const getWorkerSchedule = async (workerId: string): Promise<Schedule | null> => {
  const schedule = MOCK_SCHEDULES[workerId];
  return simulateDelay(schedule || null);
};

// --- ADMIN ---
export const getAllBookings = async (): Promise<Booking[]> => {
  const sortedBookings = MOCK_BOOKINGS.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime());
  return simulateDelay(sortedBookings);
};

export const updateTruckInventory = async (updates: Partial<TruckInventory>): Promise<TruckInventory> => {
  MOCK_TRUCK_INVENTORY = { ...MOCK_TRUCK_INVENTORY, ...updates };
  return simulateDelay(MOCK_TRUCK_INVENTORY);
};

export const getAllUsersByRole = async (role: UserRole): Promise<UserProfile[]> => {
    const users = MOCK_USERS.filter(u => u.role === role);
    return simulateDelay(users);
}

export const assignWorkerToBooking = async (bookingId: string, workerId: string, workerName: string): Promise<Booking> => {
  const bookingIndex = MOCK_BOOKINGS.findIndex(b => b.id === bookingId);
  if (bookingIndex === -1) throw new Error("Reserva no encontrada");

  MOCK_BOOKINGS[bookingIndex] = { ...MOCK_BOOKINGS[bookingIndex], workerId, workerName, status: 'confirmada' };
  
  // Actualizar horario del trabajador
  const booking = MOCK_BOOKINGS[bookingIndex];
  if (!MOCK_SCHEDULES[workerId]) {
    MOCK_SCHEDULES[workerId] = { date: booking.bookingTime.split('T')[0], assignments: [] };
  }
  
  const time = new Date(booking.bookingTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Evitar duplicados si ya existe
  if (!MOCK_SCHEDULES[workerId].assignments.some(a => a.time === time && a.plant === booking.plant)) {
    MOCK_SCHEDULES[workerId].assignments.push({
      time,
      clientName: booking.clientName,
      plant: booking.plant,
      truckType: booking.truckType
    });
    MOCK_SCHEDULES[workerId].assignments.sort((a, b) => a.time.localeCompare(b.time));
  }

  return simulateDelay(MOCK_BOOKINGS[bookingIndex]);
};

export const addUser = async (userData: Omit<UserProfile, 'uid'>): Promise<UserProfile> => {
    const newUser: UserProfile = {
        ...userData,
        uid: `${userData.role}${Date.now()}`,
    };
    MOCK_USERS.push(newUser);
    return simulateDelay(newUser);
};

export const deleteUser = async (uid: string): Promise<{ success: true }> => {
    MOCK_USERS = MOCK_USERS.filter(u => u.uid !== uid);
    return simulateDelay({ success: true });
};