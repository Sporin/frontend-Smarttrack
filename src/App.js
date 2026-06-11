// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

import Login          from './pages/Login';
import Register       from './pages/Register';
import GestorDashboard    from './pages/dashboards/GestorDashboard';
import MotoristaDashboard from './pages/dashboards/MotoristaDashboard';
import OperadorDashboard  from './pages/dashboards/OperadorDashboard';
import NovaEntrega    from './pages/motorista/NovaEntrega';
import Acompanhamento from './pages/gestor/Acompanhamento';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  function RootRedirect() {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const rotas = {
      GESTOR:    '/dashboard/gestor',
      MOTORISTA: '/dashboard/motorista',
      OPERADOR:  '/dashboard/operador',
    };
    return <Navigate to={rotas[user?.role] || '/login'} replace />;
  }

  return (
    <Routes>
      <Route path="/"         element={<RootRedirect />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/cadastro" element={<Register />} />

      <Route path="/dashboard/gestor" element={
        <PrivateRoute roles={['GESTOR']}>
          <GestorDashboard />
        </PrivateRoute>
      }/>

      <Route path="/dashboard/motorista" element={
        <PrivateRoute roles={['MOTORISTA']}>
          <MotoristaDashboard />
        </PrivateRoute>
      }/>

      <Route path="/dashboard/operador" element={
        <PrivateRoute roles={['OPERADOR']}>
          <OperadorDashboard />
        </PrivateRoute>
      }/>

      <Route path="/motorista/nova-entrega" element={
        <PrivateRoute roles={['MOTORISTA']}>
          <NovaEntrega />
        </PrivateRoute>
      }/>

      <Route path="/gestor/acompanhamento" element={
        <PrivateRoute roles={['GESTOR']}>
          <Acompanhamento />
        </PrivateRoute>
      }/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}