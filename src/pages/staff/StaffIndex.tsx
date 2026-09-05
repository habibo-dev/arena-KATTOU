import { Navigate } from 'react-router-dom';
import { useSession } from '@/store/session';
import Login from './Login';

/** /staff — login screen when signed out, role-appropriate landing when in. */
export default function StaffIndex() {
  const { session } = useSession();

  if (!session) return <Login />;

  if (session.role === 'doctor') return <Navigate to="/staff/doctor" replace />;
  return <Navigate to="/staff/queue" replace />;
}
