import { useState } from 'react';
import { CartItemDTO } from '@/DTOs/CartItemDTO';
import { SaleDTO } from '@/DTOs/SaleDTO';
import { recordSale, getSale } from '@/APIs/SaleAPI';

export default function SalesPage() {
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [items, setItems] = useState<CartItemDTO[]>([]);
    const [createdSale, setCreatedSale] = useState<SaleDTO | null>(null);
    const [loadedSale, setLoadedSale] = useState<SaleDTO | null>(null);
    const [loadSaleId, setLoadSaleId] = useState<number>(0);
    const [message, setMessage] = useState('');

    const addItem = () => {
        setItems([...items, { productId, quantity }]);
        setProductId(0);
        setQuantity(0);
    };

    const submitSale = async () => {
        try {
            const sale = await recordSale(storeId, items);
            setCreatedSale(sale);
            setItems([]);
            setMessage(`Vente créée (ID: ${sale.id})`);
        } catch (e: any) {
            setMessage(`Erreur création: ${e.message}`);
        }
    };

    const handleLoadSale = async () => {
        try {
            const s = await getSale(loadSaleId);
            setLoadedSale(s);
        } catch (e: any) {
            setMessage(`Erreur chargement: ${e.message}`);
            setLoadedSale(null);
        }
    };

    return (
        <div>
            <h1>Ventes</h1>

            <section>
                <h2>Enregistrer une vente</h2>
                <div>
                    Magasin ID:{' '}
                    <input
                        type="number"
                        value={storeId}
                        onChange={e => setStoreId(+e.target.value)}
                    />
                </div>
                <div>
                    Produit ID:{' '}
                    <input
                        type="number"
                        value={productId}
                        onChange={e => setProductId(+e.target.value)}
                    />
                    Quantité:{' '}
                    <input
                        type="number"
                        value={quantity}
                        onChange={e => setQuantity(+e.target.value)}
                    />
                    <button onClick={addItem}>Ajouter à la vente</button>
                </div>
                <ul>
                    {items.map((i, idx) => (
                        <li key={idx}>
                            Produit #{i.productId} — quantité: {i.quantity}
                        </li>
                    ))}
                </ul>
                <button onClick={submitSale}>Valider la vente</button>
                {message && <p>{message}</p>}
                {createdSale && (
                    <pre>{JSON.stringify(createdSale, null, 2)}</pre>
                )}
            </section>

            <hr />

            <section>
                <h2>Charger une vente existante</h2>
                <div>
                    Sale ID:{' '}
                    <input
                        type="number"
                        value={loadSaleId}
                        onChange={e => setLoadSaleId(+e.target.value)}
                    />
                    <button onClick={handleLoadSale}>Charger</button>
                </div>
                {loadedSale && (
                    <div>
                        <h3>Vente #{loadedSale.id}</h3>
                        <p>Magasin : {loadedSale.storeId}</p>
                        <ul>
                            {loadedSale.saleItems.map((si, i) => (
                                <li key={i}>
                                    Produit #{si.productId} — qty: {si.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}