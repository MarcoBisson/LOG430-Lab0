import { useEffect, useState } from 'react';
import type { StoreStockDTO } from '../DTOs/StoreStockDTO';
import type { UserDTO } from '../DTOs/UserDTO';
import type { ReplenishmentRequestDTO } from '../DTOs/ReplenishmentRequestDTO';
import { getCentralStock } from '../APIs/InventoryAPI';
import { requestReplenishment, approveReplenishment, getAlerts, getReplenishments } from '../APIs/LogisticsAPI';
import styles from './LogisticsPage.module.css';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/useAuthStore';
import { ProductTable } from '../components/ProductTable';
import { getProductsByStoreId } from '../APIs/ProductAPI';
import type { ProductDTO } from '../DTOs/ProductDTO';

export default function LogisticsPage() {
    const [central, setCentral] = useState<{ productId: number; stock: number; name: string }[]>([]);
    const [storeStock, setStoreStock] = useState<ProductDTO[]>([]);
    const [alerts, setAlerts] = useState<StoreStockDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [productId, setProductId] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [requests, setRequests] = useState<ReplenishmentRequestDTO[]>([]);
    const [user] = useState<UserDTO>(useAuthStore(state => state.user) as UserDTO);
    const [centralPage, setCentralPage] = useState(1);
    const [storeStockPage, setStoreStockPage] = useState(1);
    const [storeStockTotal, setStoreStockTotal] = useState(0);
    const [centralTotal, setCentralTotal] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        getCentralStock(centralPage, itemsPerPage).then(res => {
            setCentral(res.products);
            setCentralTotal(res.total);
        });
        getAlerts().then(setAlerts);
        getProductsByStoreId(storeId, storeStockPage, itemsPerPage).then(res => {
            setStoreStock(res.products);
            setStoreStockTotal(res.total);
        });
        getReplenishments().then(setRequests);
    }, [storeId, centralPage, storeStockPage]);

    const handleRequest = async () => {
        try {
            const r = await requestReplenishment(storeId, productId, quantity);
            toast.success(`Demande #${r.id} créée`);
            setAlerts(await getAlerts());
            const res = await getProductsByStoreId(storeId, storeStockPage, itemsPerPage);
            setStoreStock(res.products);
            setStoreStockTotal(res.total);
            setRequests(await getReplenishments());
        } catch (e: any) {
            toast.error(`Erreur demande: ${e.message}`);
        }
    };

    const handleApprove = async (reqId: number) => {
        try {
            await approveReplenishment(reqId);
            toast.success(`Demande #${reqId} approuvée`);
            getCentralStock(centralPage, itemsPerPage).then(res => {
                setCentral(res.products);
                setCentralTotal(res.total);
            });
            const res = await getProductsByStoreId(storeId, storeStockPage, itemsPerPage);
            setStoreStock(res.products);
            setStoreStockTotal(res.total);
            setAlerts(await getAlerts());
            setRequests(await getReplenishments());
        } catch (e: any) {
            toast.error(`Erreur approbation: ${e.message}`);
        }
    };

    const totalCentralPages = Math.ceil(centralTotal / itemsPerPage);
    const totalStoreStockPages = Math.ceil(storeStockTotal / itemsPerPage);

    return (
        <div>
            <h1>Logistique</h1>
            <div className={styles.page}>
                <section>
                    <h2>Stock central</h2>
                    <ProductTable products={central} showActions={false} />
                    <div style={{ marginTop: '0.5rem' }}>
                        <button disabled={centralPage === 1} onClick={() => setCentralPage(p => p - 1)}>Précédent</button>
                        <span style={{ margin: '0 1rem' }}>Page {centralPage} / {totalCentralPages}</span>
                        <button disabled={centralPage === totalCentralPages || totalCentralPages === 0} onClick={() => setCentralPage(p => p + 1)}>Suivant</button>
                    </div>
                </section>

                <section>
                    <h2>Stock magasin</h2>
                    <div>
                        Magasin ID:{' '}
                        <input
                            type="number"
                            value={storeId}
                            onChange={e => {
                                setStoreId(+e.target.value);
                                setStoreStockPage(1);
                            }}
                        />
                    </div>
                    <ProductTable products={storeStock} showActions={false} />
                    <div style={{ marginTop: '0.5rem' }}>
                        <button disabled={storeStockPage === 1} onClick={() => setStoreStockPage(p => p - 1)}>Précédent</button>
                        <span style={{ margin: '0 1rem' }}>Page {storeStockPage} / {totalStoreStockPages}</span>
                        <button disabled={storeStockPage === totalStoreStockPages || totalStoreStockPages === 0} onClick={() => setStoreStockPage(p => p + 1)}>Suivant</button>
                    </div>
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
                                        <option key={p.id} value={p.id}>
                                            {p.name}
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
