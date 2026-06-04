// src/components/PrivateRoute.jsx
// Componente que protege rotas — se não estiver logado, redireciona para /login
// Se estiver logado mas não tiver o papel certo, redireciona para /login também

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// roles = lista de papéis permitidos (opcional)
// Exemplo: <PrivateRoute roles={['GESTOR_LOGISTICA']} />
export function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  // Não está logado → vai para o login
  if (!isAuthenticated) { 
    return <Navigate to="/login" replace />;
  }

  // Está logado mas não tem o papel necessário → volta para o login
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  // Tudo certo → renderiza a tela normalmente
  return children;
}