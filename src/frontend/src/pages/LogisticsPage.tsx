import { useEffect, useState } from 'react';
import { StockDTO } from '../DTOs/StockDTO';
import { StoreStockDTO } from '../DTOs/StoreStockDTO';
import { ReplenishmentRequestDTO } from '../DTOs/ReplenishmentRequestDTO';
import { getStoreStock } from '../APIs/InventoryAPI';
import { getCentralStock } from '../APIs/InventoryAPI';
import { requestReplenishment, approveReplenishment, getAlerts } from '../APIs/LogisticsAPI';

export default function LogisticsPage() {
    const [central, setCentral] = useState<StockDTO[]>([]);
    const [storeStock, setStoreStock] = useState<StoreStockDTO[]>([]);
    const [alerts, setAlerts] = useState<StoreStockDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [requests, setRequests] = useState<ReplenishmentRequestDTO[]>([]);
    const [message, setMessage] = useState('');

    // au chargement : central + alertes + stock magasin + requêtes
    useEffect(() => {
        getCentralStock().then(setCentral);
        getAlerts().then(setAlerts);
        getStoreStock(storeId).then(setStoreStock);
        // si vous avez un endpoint pour lister les requests, appelez-le ici :
        // getPendingRequests().then(setRequests);
    }, [storeId]);

    const handleRequest = async () => {
        try {
            const r = await requestReplenishment(storeId, productId, quantity);
            setMessage(`Demande #${r.id} créée`);
            setAlerts(await getAlerts());
            setStoreStock(await getStoreStock(storeId));
            // setRequests(await getPendingRequests());
        } catch (e: any) {
            setMessage(`Erreur demande: ${e.message}`);
        }
    };

    const handleApprove = async (reqId: number) => {
        try {
            await approveReplenishment(reqId);
            setMessage(`Demande #${reqId} approuvée`);
            setCentral(await getCentralStock());
            setStoreStock(await getStoreStock(storeId));
            setAlerts(await getAlerts());
            // setRequests(await getPendingRequests());
        } catch (e: any) {
            setMessage(`Erreur approbation: ${e.message}`);
        }
    };

    return (
        <div>
            <h1>Logistique</h1>

            <section>
                <h2>Stock central</h2>
                <ul>
                    {central.map(c => (
                        <li key={c.productId}>
                            Produit #{c.productId} : {c.stock}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Stock magasin</h2>
                <div>
                    Magasin ID:{' '}
                    <input
                        type="number"
                        value={storeId}
                        onChange={e => setStoreId(+e.target.value)}
                    />
                </div>
                <ul>
                    {storeStock.map(s => (
                        <li key={`${s.storeId}-${s.productId}`}>
                            Produit #{s.productId} : {s.quantity}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>Nouvelle demande</h2>
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
                    <button onClick={handleRequest}>Demander</button>
                </div>
            </section>

            <section>
                <h2>Requêtes en attente</h2>
                {/* s’il existe un endpoint listant les requêtes, sinon 
            utilisez requests[] si vous l’avez peuplé */}
                {requests.length === 0
                    ? <p>Aucune requête en attente.</p>
                    : (
                        <ul>
                            {requests.map(r => (
                                <li key={r.id}>
                                    Req#{r.id} – Prod#{r.productId} x{r.quantity} –
                                    <button onClick={() => handleApprove(r.id)}>Approuver</button>
                                </li>
                            ))}
                        </ul>
                    )}
            </section>

            <section>
                <h2>Alertes rupture</h2>
                <ul>
                    {alerts.map(a => (
                        <li key={`${a.storeId}-${a.productId}`}>
                            Magasin #{a.storeId}, Produit #{a.productId}: {a.quantity}
                        </li>
                    ))}
                </ul>
            </section>

            {message && <p>{message}</p>}
        </div>
    );
}