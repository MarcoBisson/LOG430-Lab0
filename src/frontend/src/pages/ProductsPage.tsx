import { useEffect, useState } from 'react';
import { ProductDTO } from '../DTOs/ProductDTO';
import { getProducts, searchProductsByName, searchProductsByCategory, createProduct, updateProduct, deleteProduct, getProductsByStoreId } from '../APIs/ProductAPI';
import styles from './ProductPage.module.css'
import { EditProductModal } from '../components/EditProductModal';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [nameFilter, setNameFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [productBeingEdited, setProductBeingEdited] = useState<ProductDTO | null>(null);

    const fetchAll = async () => getProductsByStoreId(storeId).then(setProducts);
    useEffect(() => { 
        fetchAll(); 
    }, [storeId]);

    const handleSearch = async () => {
        if (nameFilter) setProducts(await searchProductsByName(nameFilter));
        else if (catFilter) setProducts(await searchProductsByCategory(catFilter));
        else fetchAll();
    };

    return (
        <div>
            <h1>Produits</h1>
            <h2>Stock magasin</h2>
                    <div>
                        Magasin ID:{' '}
                        <input
                            type="number"
                            value={storeId}
                            onChange={e => setStoreId(+e.target.value)}
                        />
                    </div>
            <div>
                <input
                    placeholder="Nom..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                />
                <input
                    placeholder="Catégorie..."
                    value={catFilter}
                    onChange={e => setCatFilter(e.target.value)}
                />
                <button onClick={handleSearch}>Rechercher</button>
                <button onClick={() => setProductBeingEdited({id:-1 ,name:'', price: 0, stock: 0})}>Ajouter</button>
            </div>
            <ul>
                {products.map(p => (
                    <li className={styles.table} key={p.id}>
                        <div>
                            {p.name} — {p.price}€ — stock: {p.stock}
                        </div>
                        <div>
                            <button onClick={() => setProductBeingEdited(p)}>✎</button>
                            <button onClick={async () => {
                            if (confirm('Supprimer ce produit ?')) {
                                await deleteProduct(p.id);
                                fetchAll();
                            }
                            }}>🗑</button>
                        </div>
                        
                    </li>
                ))}
            </ul>
            {productBeingEdited && (
                <EditProductModal
                    product={productBeingEdited}
                    onSave={async (data) => {
                    if (productBeingEdited.id == -1){
                        await createProduct(storeId, productBeingEdited);
                    } else {
                        await updateProduct(productBeingEdited.id, storeId, data);
                    }
                    setProductBeingEdited(null);
                    fetchAll();
                    }}
                    onClose={() => setProductBeingEdited(null)}
                />
            )}
        </div>
        
    );
}