import { useEffect, useState } from 'react';
import { ReportDTO } from '@/DTOs/ReportDTO';
import { getReport } from '@/APIs/ReportAPI';

export default function DashboardPage() {
    const [report, setReport] = useState<ReportDTO | null>(null);

    useEffect(() => {
        getReport().then(setReport);
    }, []);

    if (!report) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Dashboard consolidé</h1>
            <h2>Chiffre par magasin</h2>
            <ul>
                {report.salesByStore.map(r => (
                    <li key={r.storeId}>Magasin #{r.storeId} : {r.totalQuantity} unités</li>
                ))}
            </ul>

            <h2>Top produits</h2>
            <ul>
                {report.topProducts.map(p => (
                    <li key={p.productId}>Produit #{p.productId} : {p.totalQuantity} vendues</li>
                ))}
            </ul>

            <h2>Stock central</h2>
            <ul>
                {report.centralStock.map(c => (
                    <li key={c.productId}>Produit #{c.productId} : {c.stock} en stock</li>
                ))}
            </ul>
        </div>
    );
}