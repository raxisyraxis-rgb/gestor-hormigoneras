import React, { useState, useEffect, useCallback } from 'react';
import type { Booking, TruckInventory, UserProfile } from '../types';
// FIX: Added 'getTruckInventory' to the import list to resolve the reference error.
import { 
    getAllBookings, 
    updateTruckInventory, 
    getAllUsersByRole, 
    assignWorkerToBooking,
    addUser,
    deleteUser,
    getTruckInventory
} from '../services/api';
import Spinner from './Spinner';

type Tab = 'bookings' | 'trucks' | 'clients' | 'workers';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('bookings');

    const renderContent = () => {
        switch (activeTab) {
            case 'bookings': return <BookingsManager />;
            case 'trucks': return <TrucksManager />;
            case 'clients': return <UserManager role="client" title="Clientes" />;
            case 'workers': return <UserManager role="worker" title="Trabajadores" />;
            default: return null;
        }
    };

    const TabButton: React.FC<{tab: Tab, label: string}> = ({tab, label}) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Panel de Administración</h2>
            <div className="flex space-x-2 border-b border-slate-200 pb-2">
                <TabButton tab="bookings" label="Reservas" />
                <TabButton tab="trucks" label="Camiones" />
                <TabButton tab="clients" label="Clientes" />
                <TabButton tab="workers" label="Trabajadores" />
            </div>
            <div>{renderContent()}</div>
        </div>
    );
};

const BookingsManager: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [workers, setWorkers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [bookingsData, workersData] = await Promise.all([
                getAllBookings(),
                getAllUsersByRole('worker')
            ]);
            setBookings(bookingsData);
            setWorkers(workersData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignWorker = async (bookingId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
        const workerId = e.target.value;
        if (!workerId) return;
        const worker = workers.find(w => w.uid === workerId);
        if (!worker) return;

        try {
            await assignWorkerToBooking(bookingId, worker.uid, worker.name);
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error assigning worker:", error);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Hora</th>
                        <th scope="col" className="px-6 py-3">Cliente</th>
                        <th scope="col" className="px-6 py-3">Planta</th>
                        <th scope="col" className="px-6 py-3">Camión</th>
                        <th scope="col" className="px-6 py-3">Estado</th>
                        <th scope="col" className="px-6 py-3">Asignar Trabajador</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(booking => (
                        <tr key={booking.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{new Date(booking.bookingTime).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</td>
                            <td className="px-6 py-4">{booking.clientName}</td>
                            <td className="px-6 py-4">{booking.plant}</td>
                            <td className="px-6 py-4">{booking.truckType}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{booking.status}</span>
                            </td>
                            <td className="px-6 py-4">
                                {booking.status === 'confirmada' ? (
                                    <span>{booking.workerName}</span>
                                ) : (
                                    <select onChange={(e) => handleAssignWorker(booking.id, e)} className="border border-slate-300 rounded-md p-1">
                                        <option value="">Seleccionar...</option>
                                        {workers.map(worker => <option key={worker.uid} value={worker.uid}>{worker.name}</option>)}
                                    </select>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TrucksManager: React.FC = () => {
    const [inventory, setInventory] = useState<TruckInventory>({ threeAxle: 0, fourAxle: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            const data = await getTruckInventory();
            setInventory(data);
            setLoading(false);
        };
        fetchInventory();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await updateTruckInventory(inventory);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInventory(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg">
             <h3 className="text-xl font-bold text-slate-800 mb-4">Gestionar Inventario de Camiones</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label htmlFor="threeAxle" className="font-medium">Camiones de 3 ejes</label>
                    <input type="number" name="threeAxle" id="threeAxle" value={inventory.threeAxle} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                    <label htmlFor="fourAxle" className="font-medium">Camiones de 4 ejes</label>
                    <input type="number" name="fourAxle" id="fourAxle" value={inventory.fourAxle} onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-slate-400">
                    {loading ? 'Actualizando...' : 'Actualizar Inventario'}
                </button>
            </form>
        </div>
    );
};

const UserManager: React.FC<{ role: "client" | "worker", title: string }> = ({ role, title }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', plants: '' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const data = await getAllUsersByRole(role);
        setUsers(data);
        setLoading(false);
    }, [role]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const userData: any = {
            name: newUser.name,
            email: newUser.email,
            role,
        };
        if (role === 'client') {
            userData.plants = newUser.plants.split(',').map(p => p.trim());
        }
        await addUser(userData);
        setNewUser({ name: '', email: '', plants: '' });
        setIsAdding(false);
        fetchUsers();
    };

    const handleDeleteUser = async (uid: string) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) {
            await deleteUser(uid);
            fetchUsers();
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;
    
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">Gestionar {title}</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm">
                    {isAdding ? 'Cancelar' : `Añadir ${title.slice(0, -2)}`}
                </button>
            </div>
            
            {isAdding && (
                <form onSubmit={handleAddUser} className="mb-6 p-4 border rounded-lg bg-slate-50 space-y-3">
                    <input type="text" placeholder="Nombre" value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} className="w-full p-2 border rounded" required />
                    <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} className="w-full p-2 border rounded" required />
                    {role === 'client' && <input type="text" placeholder="Plantas (separadas por coma)" value={newUser.plants} onChange={e => setNewUser(p => ({...p, plants: e.target.value}))} className="w-full p-2 border rounded" />}
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">Guardar</button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Email</th>
                            {role === 'client' && <th className="px-6 py-3">Plantas</th>}
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.uid} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                {role === 'client' && <td className="px-6 py-4">{user.plants?.join(', ')}</td>}
                                <td className="px-6 py-4">
                                    <button onClick={() => handleDeleteUser(user.uid)} className="text-red-500 hover:underline font-medium">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;