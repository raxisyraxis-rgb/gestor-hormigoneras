
import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import ClientDashboard from './components/ClientDashboard';
import WorkerDashboard from './components/WorkerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Spinner from './components/Spinner';
import Header from './components/Header';

const App: React.FC = () => {
  const { user, role, loading, logout } = useAuth();

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      );
    }

    if (!user) {
      return <Login />;
    }

    return (
      <>
        <Header user={user} onLogout={logout} />
        <main className="p-4 md:p-8">
          {role === 'client' && <ClientDashboard user={user} />}
          {role === 'worker' && <WorkerDashboard user={user} />}
          {role === 'owner' && <AdminDashboard />}
        </main>
      </>
    );
  };

  return <div className="min-h-screen bg-slate-100">{renderContent()}</div>;
};

export default App;
