
import React from 'react';
import type { UserProfile } from '../types';
import { TruckIcon, UserIcon, LogoutIcon } from './icons';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <TruckIcon className="h-8 w-8 text-sky-600" />
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">
            Gestor de Hormigoneras
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-6 w-6 text-slate-500" />
            <span className="hidden sm:inline text-slate-700 font-medium">{user.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition duration-300"
            aria-label="Cerrar sesión"
          >
            <LogoutIcon className="h-5 w-5" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
