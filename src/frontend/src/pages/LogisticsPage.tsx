import { useEffect, useState } from 'react';
import { StockDTO } from '@/DTOs/StockDTO';
import { StoreStockDTO } from '@/DTOs/StoreStockDTO';
import { getCentralStock } from '@/APIs/InventoryAPI';
import { requestReplenishment, getAlerts } from '@/APIs/LogisticsAPI';

export default function LogisticsPage() {
    const [central, setCentral] = useState<StockDTO[]>([]);
    const [alerts, setAlerts] = useState<StoreStockDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        getCentralStock().then(setCentral);
        getAlerts().then(setAlerts);
    }, []);

    const handleRequest = async () => {
        try {
            await requestReplenishment(storeId, productId, quantity);
            setMessage('Demande envoyée.');
            setAlerts(await getAlerts());
        } catch (e: any) {
            setMessage(`Erreur: ${e.message}`);
        }
    };

    return (
        <div>
            <h1>Logistique</h1>

            <h2>Stock central</h2>
            <ul>
                {central.map(c => (
                    <li key={c.productId}>Produit #{c.productId} : {c.stock}</li>
                ))}
            </ul>

            <h2>Nouvelle demande</h2>
            <div>
                Magasin ID: <input type="number" value={storeId} onChange={e => setStoreId(+e.target.value)} />
                Produit ID: <input type="number" value={productId} onChange={e => setProductId(+e.target.value)} />
                Quantité: <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
                <button onClick={handleRequest}>Demander</button>
            </div>
            {message && <p>{message}</p>}

            <h2>Alertes rupture</h2>
            <ul>
                {alerts.map(a => (
                    <li key={`${a.storeId}-${a.productId}`}>
                        Magasin #{a.storeId}, Produit #{a.productId}: {a.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
}