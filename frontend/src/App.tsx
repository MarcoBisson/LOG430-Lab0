import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
// import { AddProductForm } from "./components/AddProductForm";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 10 }}>
        <Link to="/" style={{ marginRight: 10 }}>Produits</Link>
        {/* <Link to="/add">Ajouter un produit</Link> */}
      </nav>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        {/* <Route path="/add" element={<div style={{ padding: 20 }}><h1>Ajouter un produit</h1><AddProductForm/></div>} /> */}
      </Routes>
    </BrowserRouter>
  );
}
