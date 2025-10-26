
import React, { useState, useEffect } from 'react';
import type { UserProfile, Schedule } from '../types';
import { getWorkerSchedule } from '../services/api';
import Spinner from './Spinner';
import { CalendarIcon } from './icons';

interface WorkerDashboardProps {
  user: UserProfile;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await getWorkerSchedule(user.uid);
        setSchedule(data);
      } catch (error) {
        console.error("Error al cargar el horario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user.uid]);

  return (
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Hola, {user.name}</h2>
      <p className="text-lg text-slate-600 mb-8">Este es tu horario de trabajo para mañana, <strong>{tomorrowFormatted}</strong>.</p>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <CalendarIcon className="h-6 w-6 text-sky-500" />
            <span>Tareas Asignadas</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Spinner />
          </div>
        ) : schedule && schedule.assignments.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {schedule.assignments.map((assignment, index) => (
              <div key={index} className="grid grid-cols-3 md:grid-cols-4 gap-4 p-6 hover:bg-slate-50 transition-colors">
                <div className="font-bold text-sky-600 text-lg">{assignment.time}</div>
                <div className="col-span-2 md:col-span-1">
                  <p className="font-semibold text-slate-800">{assignment.clientName}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-slate-600">{assignment.plant}</p>
                </div>
                <div>
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                    {assignment.truckType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10">
            <p className="text-slate-500">No tienes tareas asignadas para mañana.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
