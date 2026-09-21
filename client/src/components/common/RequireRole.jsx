import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardPathFor } from '../../utils/roles';

export default function RequireRole({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={dashboardPathFor(user.role)} replace />;
  }

  return children;
}