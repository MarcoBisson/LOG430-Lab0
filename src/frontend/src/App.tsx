import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage';
import ReturnsPage from './pages/ReturnsPage';
import DashboardPage from './pages/DashboardPage';
import LogisticsPage from './pages/LogisticsPage';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <Router>
      <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
        <NavLink to="/" end style={{ margin: 5 }}>Dashboard</NavLink>
        <NavLink to="/products" style={{ margin: 5 }}>Produits</NavLink>
        <NavLink to="/sales" style={{ margin: 5 }}>Ventes</NavLink>
        <NavLink to="/returns" style={{ margin: 5 }}>Retours</NavLink>
        <NavLink to="/logistics" style={{ margin: 5 }}>Logistique</NavLink>
      </nav>
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/logistics" element={<LogisticsPage />} />
        </Routes>
      </div>

      <ToastContainer position="top-center" theme='colored' autoClose={3000} />
    </Router>
    
  );
}