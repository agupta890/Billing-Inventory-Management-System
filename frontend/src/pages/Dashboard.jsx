import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import OwnerDashboard from '../components/Dashboard/OwnerDashboard';
import EmployeeDashboard from '../components/Dashboard/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="w-full">
      {user?.role === 'owner' ? <OwnerDashboard /> : <EmployeeDashboard />}
    </div>
  );
};

export default Dashboard;
