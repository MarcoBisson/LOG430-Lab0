import { useState } from 'react';
import { CartItemDTO } from '@/DTOs/CartItemDTO';
import { recordSale } from '@/APIs/SaleAPI';

export default function SalesPage() {
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [items, setItems] = useState<CartItemDTO[]>([]);
    const [message, setMessage] = useState('');

    const addItem = () => {
        setItems([...items, { productId, quantity }]);
        setProductId(0);
        setQuantity(0);
    };

    const submitSale = async () => {
        try {
            const sale = await recordSale(storeId, items);
            setMessage(`Vente créée (ID: ${sale.id})`);
            setItems([]);
        } catch (e: any) {
            setMessage(`Erreur: ${e.message}`);
        }
    };

    return (
        <div>
            <h1>Enregistrer une vente</h1>
            <div>
                Magasin ID: <input type="number" value={storeId} onChange={e => setStoreId(+e.target.value)} />
            </div>
            <div>
                Produit ID: <input type="number" value={productId} onChange={e => setProductId(+e.target.value)} />
                Quantité: <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
                <button onClick={addItem}>Ajouter à la vente</button>
            </div>
            <ul>
                {items.map((i, idx) => (
                    <li key={idx}>Produit #{i.productId} — quantité: {i.quantity}</li>
                ))}
            </ul>
            <button onClick={submitSale}>Valider la vente</button>
            {message && <p>{message}</p>}
        </div>
    );
}