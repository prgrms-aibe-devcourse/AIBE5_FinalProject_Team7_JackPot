import { Navigate } from 'react-router-dom';
import { PATHS } from '@/app/router/paths';

export default function MyBarRedirect() {
  return <Navigate to={PATHS.CABINET} replace />;
}
