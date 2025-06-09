'use client';

import { useAuthRouting } from '../../hooks/useAuthRouting';
import LoadingScreen from '../../components/LoadingScreen';
import EmployeeDashboard from '../../components/EmployeeDashboard';

export default function EmployeePage() {
  const { user, loading, handleLogout } = useAuthRouting();

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return (
    <EmployeeDashboard 
      user={user}
      onLogout={handleLogout}
    />
  );
}