import { useEffect, useState } from 'react';
import type { ReportDTO } from '../DTOs/ReportDTO';
import { getReport } from '../APIs/ReportAPI';
import styles  from './DashboardPage.module.css';

export default function DashboardPage() {
    const [report, setReport] = useState<ReportDTO | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        // Chargement initial avec dates nulles
        getReport().then(setReport);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = await getReport(startDate, endDate);
        setReport(data);
    };

    if (!report) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Dashboard consolidé</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Date de début :
                    <input className={styles.date} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </label>
                <label>
                    Date de fin :
                    <input className={styles.date} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </label>
                <button type="submit">Filtrer</button>
            </form>

            <div className={styles.page}>
                <div>
                    <h2>Chiffre par magasin</h2>
                    <ul>
                        {report.salesByStore.map(r => (
                            <li key={r.storeId}>Magasin #{r.storeId} : {r.totalQuantity} unités</li>
                        ))}
                    </ul>
                </div>

                
                <div>
                    <h2>Top produits</h2>
                    <ul>
                        {report.topProducts.map(p => (
                            <li key={p.productId}>Produit #{p.productId} : {p.totalQuantity} vendues</li>
                        ))}
                    </ul>
                </div>
                
                <div>
                    <h2>Stock central</h2>
                    <ul>
                        {report.centralStock.map(c => (
                            <li key={c.productId}>Produit #{c.productId} : {c.stock} en stock</li>
                        ))}
                    </ul>
                </div>

            </div>
            
        </div>
    );
}
