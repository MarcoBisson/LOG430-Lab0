import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage';
import ReturnsPage from './pages/ReturnsPage';
import DashboardPage from './pages/DashboardPage';
import LogisticsPage from './pages/LogisticsPage';
import { ToastContainer } from 'react-toastify';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { toast } from 'react-toastify';
import { useAuthStore } from './stores/useAuthStore';

export default function App() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const user = useAuthStore(state => state.user);

  function handleLogout() {
    const clearStore = useAuthStore.getState().clear;
    clearStore(); 
    localStorage.removeItem('token');
    toast.info('Déconnecté avec succès');
    navigate('/login');
  };
  return (
    <>
        {isAuthenticated && (
          <nav style={{ padding: 10, borderBottom: '1px solid #ccc', display: 'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              {user?.role !== 'CLIENT' && (
                <>
                  <NavLink to="/" end style={{ margin: 5 }}>Dashboard</NavLink>
                  <NavLink to="/logistics" style={{ margin: 5 }}>Logistique</NavLink>
                </>
              )}
              {user?.role !== 'CLIENT' && user?.role !== 'STAFF' && (
                <NavLink to="/products" style={{ margin: 5 }}>Produits</NavLink>
              )}
              <NavLink to="/sales" style={{ margin: 5 }}>Ventes</NavLink>
              <NavLink to="/returns" style={{ margin: 5 }}>Retours</NavLink>
            </div>
            <div>
              <button onClick={handleLogout} style={{ marginLeft: 10 }}>
                Déconnexion
              </button>
            </div>
          </nav>
        )}
      
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/logistics" element={<ProtectedRoute><LogisticsPage /></ProtectedRoute>} />
        </Routes>
      </div>

      <ToastContainer position="top-center" theme='colored' autoClose={3000} />
    </>
    
  );
}