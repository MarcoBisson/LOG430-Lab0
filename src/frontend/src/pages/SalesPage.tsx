import { useEffect, useState } from 'react';
import type { CartItemDTO } from '../DTOs/CartItemDTO';
import type { SaleDTO } from '../DTOs/SaleDTO';
import { recordSale, getSale } from '../APIs/SaleAPI';
import { getProductsByStoreId } from '../APIs/ProductAPI';
import type { ProductDTO } from '../DTOs/ProductDTO';
import { toast } from 'react-toastify';

export default function SalesPage() {
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [items, setItems] = useState<CartItemDTO[]>([]);
    const [createdSale, setCreatedSale] = useState<SaleDTO | null>(null);
    const [loadedSale, setLoadedSale] = useState<SaleDTO | null>(null);
    const [loadSaleId, setLoadSaleId] = useState<number>(0);
    const [products, setProducts] = useState<ProductDTO[]>([]);

    const fetchAll = async () => getProductsByStoreId(storeId).then(setProducts);
        useEffect(() => { 
            fetchAll(); 
        }, [storeId]);
        
    const addItem = () => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            if (product.stock >= quantity)
                setItems([...items, { storeId, productId, productName: product.name, quantity, unitPrice: product.price }]);
            else 
                toast.error(`Stock insuffisant pour le produit: ${product.name}`);
        } else {
            toast.error('Produit introuvable ou non disponible');
        }
            
        setProductId(0);
        setQuantity(0);
    };

    const submitSale = async () => {
        try {
            const sale = await recordSale(storeId, items);
            setCreatedSale(sale);
            setItems([]);
            toast.success(`Vente créée (ID: ${sale.id})`);
        } catch (e: any) {
            toast.error(`Erreur création: ${e.message}`);
        }
    };

    const handleLoadSale = async () => {
        try {
            const s = await getSale(loadSaleId);
            setLoadedSale(s);
        } catch (e: any) {
            toast.error(`Erreur chargement: ${e.message}`);
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
                        onChange={(e) => {
                            setStoreId(+e.target.value);
                            setItems([]);
                        }}
                    />
                </div>
                <div>
                    Produit ID:{' '}
                    <select 
                        value={productId}
                        onChange={(e) => setProductId(Number(e.target.value))}
                    >
                        <option value="">-- Sélectionnez un produit --</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                         ))}
                    </select>
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
