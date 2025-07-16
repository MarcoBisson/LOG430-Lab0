import { useEffect, useState } from 'react';
import type { ProductDTO } from '../DTOs/ProductDTO';
import { searchProductsByName, searchProductsByCategory, createProduct, updateProduct, deleteProduct, getProductsByStoreId } from '../APIs/ProductAPI';
import { EditProductModal } from '../components/EditProductModal';
import { ProductTable } from '../components/ProductTable';
import { toast } from 'react-toastify';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [storeId, setStoreId] = useState(1);
    const [nameFilter, setNameFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [productBeingEdited, setProductBeingEdited] = useState<ProductDTO | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const itemsPerPage = 10;

    const fetchAll = async (page = 1) => {
        const res = await getProductsByStoreId(storeId, page, itemsPerPage);
        setProducts(res.products);
        setTotal(res.total);
    };
    useEffect(() => { 
        fetchAll(currentPage); 
    }, [storeId, currentPage]);

    const handleSearch = async () => {
        // Pour la recherche, il faudrait aussi adapter l'API pour supporter la pagination côté serveur
        if (nameFilter) setProducts(await searchProductsByName(nameFilter));
        else if (catFilter) setProducts(await searchProductsByCategory(catFilter));
        else fetchAll(currentPage);
    };

    const totalPages = Math.ceil(total / itemsPerPage);

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
                <button onClick={() => setProductBeingEdited({id:-1 ,name:'', price: 0, stock: 0, description: '', category: ''})}>Ajouter</button>
            </div>
            <ProductTable
                products={products}
                onEdit={(product) => {
                    if (typeof product.id === 'number') {
                        setProductBeingEdited({
                            id: product.id as number,
                            name: product.name ?? '',
                            price: product.price ?? 0,
                            stock: product.stock ?? 0,
                            description: product.description ?? '',
                            category: product.category ?? '',
                        });
                    } else {
                        toast.error("Impossible d'éditer : ID du produit manquant.");
                    }
                }}
                onDelete={async (p) => {
                    if (confirm('Supprimer ce produit ?')) {
                        if (typeof p.id === 'number') {
                            await deleteProduct(p.id);
                            toast.success(`Produit #${p.id} supprimé`);
                            fetchAll(currentPage);
                        } else {
                            toast.error('Impossible de supprimer : ID du produit manquant.');
                        }
                    }
                }}
            />
            <div style={{ marginTop: '1rem' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Précédent</button>
                <span style={{ margin: '0 1rem' }}>Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Suivant</button>
            </div>
            {productBeingEdited && (
                <EditProductModal
                    product={productBeingEdited}
                    onSave={async (data) => {
                        if (productBeingEdited.id === -1){
                            await createProduct(storeId, data);
                        } else {
                            await updateProduct(productBeingEdited.id, storeId, data);
                        }
                        setProductBeingEdited(null);
                        fetchAll(currentPage);
                    }}
                    onClose={() => setProductBeingEdited(null)}
                />
            )}
        </div>
        
    );
}
