// frontend/src/pages/ProductsPage.tsx
import { useState } from "react";
import { useProducts } from "../hooks/useProducts";
import { useSell } from "../hooks/useSales";

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts();
  const sell = useSell();
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});

  if (isLoading) return <p>Chargement…</p>;
  if (error) return <p>Erreur de chargement</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Liste des produits</h1>
      <table>
        <thead>
          <tr>
            <th>Produit</th><th>Prix</th><th>Stock</th><th>Quantité</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price.toFixed(2)} $</td>
              <td>{p.stock}</td>
              <td>
                <input
                  type="number"
                  min={1} max={p.stock}
                  value={qtyMap[p.id] || ""}
                  onChange={e =>
                    setQtyMap({ ...qtyMap, [p.id]: +e.target.value })
                  }
                  style={{ width: 60 }}
                />
              </td>
              <td>
                <button
                  disabled={!qtyMap[p.id] || sell.isPending}
                  onClick={() => sell.mutate({ productId: p.id, quantity: qtyMap[p.id] })}
                >
                  Vendre
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
