import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import type { ReportDTO } from '../DTOs/ReportDTO';
import { getReport } from '../APIs/ReportAPI';
import styles  from './DashboardPage.module.css';
import { ProductTable } from '../components/ProductTable';

export default function DashboardPage() {
    const user = useAuthStore(state => state.user);
    const userRole = user?.role || null;
    const [stockPage, setStockPage] = useState(1);
    const PAGE_SIZE = 20;
    const [report, setReport] = useState<ReportDTO | null>(null);
    const currentYear = new Date().getFullYear();
    const defaultStart = `${currentYear}-01-01`;
    const defaultEnd = `${currentYear}-12-31`;
    const [startDate, setStartDate] = useState<string>(defaultStart);
    const [endDate, setEndDate] = useState<string>(defaultEnd);

    const fetchReport = async (
        sDate = startDate,
        eDate = endDate,
        stockPg = stockPage,
    ) => {
        const data = await getReport(
            sDate,
            eDate,
            {
                limit: PAGE_SIZE,
                stockOffset: stockPg,
            },
        );
        setReport(data);
    };

    // Initial load
    useEffect(() => {
        fetchReport();
    }, []);

    // Pagination handler uniquement pour le stock
    const handleStockPage = (newPage: number) => {
        setStockPage(newPage);
        fetchReport(startDate, endDate, newPage);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStockPage(1);
        fetchReport(startDate, endDate, 1);
    };

    if (!report) return <div>Chargement...</div>;


    // Les données sont déjà paginées côté backend pour le stock uniquement
    const allSales = report.salesByStore;
    const allProducts = report.topProducts;
    const paginatedStock = report.centralStock;

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
                        {allSales.map(r => (
                            <li key={r.storeId}>Magasin #{r.storeId} : {r.totalQuantity} unités</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2>Top produits</h2>
                    <ul>
                        {allProducts.map(p => (
                            <li key={p.productId}>Produit #{p.productId} : {p.totalQuantity} vendues</li>
                        ))}
                    </ul>
                </div>

                {(userRole === 'ADMIN' || userRole === 'LOGISTICS') && (
                    <div>
                        <h2>Stock central</h2>
                        <ProductTable products={paginatedStock} showActions={false} />
                        <div>
                            <button disabled={stockPage === 1} onClick={() => handleStockPage(stockPage-1)}>Précédent</button>
                            <span> Page {stockPage} / {Math.ceil((report.centralStockTotal || 1) / PAGE_SIZE)} </span>
                            <button disabled={stockPage === Math.ceil((report.centralStockTotal || 1) / PAGE_SIZE)} onClick={() => handleStockPage(stockPage+1)}>Suivant</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
