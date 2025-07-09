import { useState, useEffect } from 'react';

type EditProductModalProps = {
  product: { id: number; name: string; price: number; stock: number }
  onSave: (data: { name: string; price: number; stock: number }) => void
  onClose: () => void
}

export function EditProductModal({ product, onSave, onClose }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);

  useEffect(() => {
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
  }, [product]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Modifier le produit</h2>

        <label>Nom</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <label>Prix (€)</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />

        <label>Stock</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value))}
        />

        <div style={styles.actions}>
          <button onClick={() => onSave({ name, price, stock })}>💾 Enregistrer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    color:'while',
    padding: '2rem',
    borderRadius: '8px',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};
