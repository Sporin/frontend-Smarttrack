// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Importando as páginas reais
import Login    from './pages/Login';
import Register from './pages/Register';
import GestorDashboard    from './pages/dashboards/GestorDashboard';
import MotoristaDashboard from './pages/dashboards/MotoristaDashboard';
import OperadorDashboard  from './pages/dashboards/OperadorDashboard';

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  function RootRedirect() {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const rotas = {
      GESTOR_LOGISTICA:        '/dashboard/gestor',
      MOTORISTA:               '/dashboard/motorista',
      OPERADOR_ADMINISTRATIVO: '/dashboard/operador',
    };
    return <Navigate to={rotas[user?.role] || '/login'} replace />;
  }

  return (
    <Routes>
      <Route path="/"         element={<RootRedirect />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/cadastro" element={<Register />} />

      <Route path="/dashboard/gestor" element={
        <PrivateRoute roles={['GESTOR_LOGISTICA']}>
          <GestorDashboard />
        </PrivateRoute>
      }/>

      <Route path="/dashboard/motorista" element={
        <PrivateRoute roles={['MOTORISTA']}>
          <MotoristaDashboard />
        </PrivateRoute>
      }/>

      <Route path="/dashboard/operador" element={
        <PrivateRoute roles={['OPERADOR_ADMINISTRATIVO']}>
          <OperadorDashboard />
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