import { useEffect, useState } from 'react';
import type { StockDTO } from '../DTOs/StockDTO';
import type { StoreStockDTO } from '../DTOs/StoreStockDTO';
import type { UserDTO } from '../DTOs/UserDTO';
import type { ReplenishmentRequestDTO } from '../DTOs/ReplenishmentRequestDTO';
import { getStoreStock } from '../APIs/InventoryAPI';
import { getCentralStock } from '../APIs/InventoryAPI';
import { requestReplenishment, approveReplenishment, getAlerts, getReplenishments } from '../APIs/LogisticsAPI';
import styles from './LogisticsPage.module.css';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/useAuthStore';

export default function LogisticsPage() {
    const [central, setCentral] = useState<StockDTO[]>([]);
    const [storeStock, setStoreStock] = useState<StoreStockDTO[]>([]);
    const [alerts, setAlerts] = useState<StoreStockDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [requests, setRequests] = useState<ReplenishmentRequestDTO[]>([]);
    const [user] = useState<UserDTO>(useAuthStore(state => state.user) as UserDTO);

    // au chargement : central + alertes + stock magasin + requêtes
    useEffect(() => {
        getCentralStock().then(setCentral);
        getAlerts().then(setAlerts);
        getStoreStock(storeId).then(setStoreStock);
        getReplenishments().then(setRequests);
    }, [storeId]);

    const handleRequest = async () => {
        try {
            const r = await requestReplenishment(storeId, productId, quantity);
            toast.success(`Demande #${r.id} créée`);
            setAlerts(await getAlerts());
            setStoreStock(await getStoreStock(storeId));
            setRequests(await getReplenishments());
        } catch (e: any) {
            toast.error(`Erreur demande: ${e.message}`);
        }
    };

    const handleApprove = async (reqId: number) => {
        try {
            await approveReplenishment(reqId);
            toast.success(`Demande #${reqId} approuvée`);
            setCentral(await getCentralStock());
            setStoreStock(await getStoreStock(storeId));
            setAlerts(await getAlerts());
            setRequests(await getReplenishments());
        } catch (e: any) {
            toast.error(`Erreur approbation: ${e.message}`);
        }
    };

    return (
        <div>
            <h1>Logistique</h1>
            <div className={styles.page}>
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
                

                <div className={styles.actions}>
                    <section>
                        <h2>Nouvelle demande</h2>
                        <div>
                            Produit ID:{' '}
                            <select
                                value={productId}
                                onChange={e => setProductId(+e.target.value)}
                            >
                                <option value="">-- Sélectionnez un produit --</option>
                                {
                                    storeStock.map((p)=>(
                                        <option key={p.productId} value={p.productId}>
                                            {p.productId}
                                        </option>
                                    ))
                                }
                            </select>
                            Quantité:{' '}
                            <input
                                type="number"
                                value={quantity}
                                onChange={e => setQuantity(+e.target.value)}
                            />
                            <button onClick={handleRequest}>Demander</button>
                        </div>
                    </section>

                    { user.role !== 'STAFF' && (
                        <>
                            <section>
                                <h2>Requêtes en attente</h2>
                                {requests.length === 0
                                    ? <p>Aucune requête en attente.</p>
                                    : (
                                        <ul>
                                            {requests.map(r => (
                                                <li key={r.id}>
                                                    <span>
                                                        Req#{r.id} – Magasin ID# {r.storeId} – Produit #{r.productId} – Quantité : {r.quantity} – Status : {r.status}
                                                    </span>
                                                    <button onClick={() => handleApprove(r.id)} hidden={r.status === 'APPROVED'}>Approuver</button>
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
                        </>
                    )}
                </div>
            </div>
            
        </div>
    );
}
