
export type UserRole = 'client' | 'worker' | 'owner';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  plants?: string[];
}

export interface TruckInventory {
  threeAxle: number;
  fourAxle: number;
}

export type TruckType = '3-ejes' | '4-ejes';

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  plant: string;
  truckType: TruckType;
  bookingTime: string; // Stored as ISO string
  status: 'pendiente' | 'confirmada' | 'completada';
  workerId?: string;
  workerName?: string;
}

export interface Schedule {
  date: string; // YYYY-MM-DD
  assignments: {
    time: string; // HH:mm
    clientName: string;
    plant: string;
    truckType: TruckType;
  }[];
}
