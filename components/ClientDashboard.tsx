
import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, TruckInventory, TruckType } from '../types';
import { getTruckInventory, createBooking } from '../services/api';
import { TruckIcon, CalendarIcon, BuildingStorefrontIcon } from './icons';
import Spinner from './Spinner';

interface ClientDashboardProps {
  user: UserProfile;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [inventory, setInventory] = useState<TruckInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingState, setBookingState] = useState({
    plant: user.plants?.[0] || '',
    truckType: '3-ejes' as TruckType,
    time: '08:00',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTruckInventory();
      setInventory(data);
    } catch (error) {
      console.error("Error al cargar el inventario:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setConfirmation('');
    try {
        const bookingTime = `${tomorrowISO}T${bookingState.time}:00.000Z`;
        await createBooking({
            clientId: user.uid,
            plant: bookingState.plant,
            truckType: bookingState.truckType,
            bookingTime: bookingTime,
        });
        setConfirmation(`¡Reserva confirmada! Un camión de ${bookingState.truckType} ha sido reservado para el ${tomorrowFormatted} a las ${bookingState.time} en ${bookingState.plant}.`);
        fetchInventory(); // Actualizar inventario
        setTimeout(() => setConfirmation(''), 5000);
    } catch (error) {
        console.error("Error al crear la reserva:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTruckTypeChange = (type: TruckType) => {
    setBookingState(prev => ({ ...prev, truckType: type }));
  }

  return (
    <div className="container mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-slate-800">Bienvenido, {user.name}</h2>

      {/* Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 font-semibold">Camiones de 3 ejes disponibles</h3>
            {loading ? <div className="h-10 w-10 mt-2 rounded-full bg-slate-200 animate-pulse"></div> : <p className="text-4xl font-bold text-sky-600">{inventory?.threeAxle}</p>}
          </div>
          <TruckIcon className="h-16 w-16 text-sky-200" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <h3 className="text-slate-500 font-semibold">Camiones de 4 ejes disponibles</h3>
            {loading ? <div className="h-10 w-10 mt-2 rounded-full bg-slate-200 animate-pulse"></div> : <p className="text-4xl font-bold text-sky-600">{inventory?.fourAxle}</p>}
          </div>
          <TruckIcon className="h-16 w-16 text-sky-200" />
        </div>
      </div>

      {/* Formulario de Reserva */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Realizar una nueva reserva</h3>
        <p className="mb-4 text-slate-600">Todas las reservas se realizan para el día siguiente: <strong>{tomorrowFormatted}</strong>.</p>
        
        {confirmation && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 border-l-4 border-green-500 rounded-lg">
            {confirmation}
          </div>
        )}

        <form onSubmit={handleBookingSubmit} className="space-y-6">
          
          <div>
            <label className="block text-lg font-medium text-slate-700 mb-2">1. Seleccione el tipo de camión</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" onClick={() => handleTruckTypeChange('3-ejes')} className={`p-4 rounded-lg border-2 text-left ${bookingState.truckType === '3-ejes' ? 'border-sky-500 bg-sky-50' : 'border-slate-300'}`}>
                <p className="font-bold text-slate-800">3 Ejes</p>
                <p className="text-sm text-slate-500">Ideal para cargas estándar</p>
              </button>
              <button type="button" onClick={() => handleTruckTypeChange('4-ejes')} className={`p-4 rounded-lg border-2 text-left ${bookingState.truckType === '4-ejes' ? 'border-sky-500 bg-sky-50' : 'border-slate-300'}`}>
                <p className="font-bold text-slate-800">4 Ejes</p>
                <p className="text-sm text-slate-500">Para mayores volúmenes</p>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="plant" className="block text-sm font-medium text-slate-700">2. Planta de recogida</label>
              <div className="relative mt-1">
                <BuildingStorefrontIcon className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-slate-400" />
                <select id="plant" name="plant" value={bookingState.plant} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 appearance-none">
                  {user.plants?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-slate-700">3. Hora de recogida</label>
              <div className="relative mt-1">
                <CalendarIcon className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-slate-400" />
                 <input
                  id="time"
                  name="time"
                  type="time"
                  value={bookingState.time}
                  onChange={handleInputChange}
                  min="07:00"
                  max="18:00"
                  step="900" // 15 minutos
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
             <button
                type="submit"
                disabled={isSubmitting || (bookingState.truckType === '3-ejes' && (inventory?.threeAxle ?? 0) <= 0) || (bookingState.truckType === '4-ejes' && (inventory?.fourAxle ?? 0) <= 0)}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                {isSubmitting ? <Spinner /> : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientDashboard;
