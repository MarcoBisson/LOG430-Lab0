import styles from '../pages/ProductPage.module.css';

type ProductDTO = {
    id?: number;
    name?: string;
    price?: number;
    stock?: number;
    description?: string;
    category?: string;
};

type CentralStockDTO = {
    productId: number;
    name: string;
    stock: number;
};

type ProductTableProps = {
    products: (ProductDTO | CentralStockDTO)[];
    onEdit?: (product: ProductDTO) => void;
    onDelete?: (product: ProductDTO) => void;
    showActions?: boolean;
};

function isCentralStock(obj: any): obj is CentralStockDTO {
    return (
        typeof obj.productId === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.stock === 'number' &&
        Object.keys(obj).length === 3
    );
}

export function ProductTable({ products, onEdit, onDelete, showActions = true }: ProductTableProps) {
    if (products.length > 0 && isCentralStock(products[0])) {
        // Affichage simplifié pour CentralStockDTO
        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, idx) => (
                        <tr key={(p as CentralStockDTO).productId ?? idx}>
                            <td>{(p as CentralStockDTO).name}</td>
                            <td>{(p as CentralStockDTO).stock}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    // Affichage complet pour ProductDTO
    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Prix (€)</th>
                    <th>Stock</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    {showActions && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {products.map((p, idx) => (
                    <tr key={(p as ProductDTO).id ?? idx}>
                        <td>{(p as ProductDTO).name}</td>
                        <td>{typeof (p as ProductDTO).price === 'number' ? (p as ProductDTO).price!.toFixed(2) : ''}</td>
                        <td>{typeof (p as ProductDTO).stock === 'number' ? (p as ProductDTO).stock : ''}</td>
                        <td>{(p as ProductDTO).description ?? ''}</td>
                        <td>{(p as ProductDTO).category ?? ''}</td>
                        {showActions && (
                            <td>
                                {onEdit && <button onClick={() => onEdit(p as ProductDTO)}>✎</button>}
                                {onDelete && <button onClick={() => onDelete(p as ProductDTO)}>🗑</button>}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
