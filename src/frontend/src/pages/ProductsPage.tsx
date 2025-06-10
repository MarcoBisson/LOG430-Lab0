import { useEffect, useState } from 'react';
import { ProductDTO } from '../DTOs/ProductDTO';
import { getProducts, searchProductsByName, searchProductsByCategory, createProduct, updateProduct, deleteProduct } from '../APIs/ProductAPI';

export default function ProductsPage() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [nameFilter, setNameFilter] = useState('');
    const [catFilter, setCatFilter] = useState('');

    const fetchAll = async () => setProducts(await getProducts());
    useEffect(() => { fetchAll(); }, []);

    const handleSearch = async () => {
        if (nameFilter) setProducts(await searchProductsByName(nameFilter));
        else if (catFilter) setProducts(await searchProductsByCategory(catFilter));
        else fetchAll();
    };

    return (
        <div>
            <h1>Produits</h1>
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
                <button onClick={async () => {
                    const name = prompt('Nom du produit');
                    const price = parseFloat(prompt('Prix') || '0');
                    if (name) {
                        await createProduct({ name, price, stock: 0 });
                        fetchAll();
                    }
                }}>Ajouter</button>
            </div>
            <ul>
                {products.map(p => (
                    <li key={p.id}>
                        {p.name} — {p.price}€ — stock: {p.stock}
                        <button onClick={async () => {
                            const price = parseFloat(prompt('Nouveau prix', `${p.price}`) || '');
                            if (!isNaN(price)) {
                                await updateProduct(p.id, { price });
                                fetchAll();
                            }
                        }}>✎</button>
                        <button onClick={async () => {
                            if (confirm('Supprimer ce produit ?')) {
                                await deleteProduct(p.id);
                                fetchAll();
                            }
                        }}>🗑</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}