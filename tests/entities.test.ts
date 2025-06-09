import { Product, CartItem } from '../src/backend/domain/entities';

describe('Product', () => {
    it('doit initialiser correctement toutes ses propriétés', () => {
        const id = 42;
        const name = 'Produit Test';
        const price = 19.99;
        const stock = 250;

        const prod = new Product(id, name, price, stock);

        expect(prod.id).toBe(id);
        expect(prod.name).toBe(name);
        expect(prod.price).toBe(price);
        expect(prod.stock).toBe(stock);
    });
});

describe('CartItem', () => {
    it('doit initialiser correctement productId et quantity', () => {
        const productId = 7;
        const quantity = 3;

        const item = new CartItem(productId, quantity);

        expect(item.productId).toBe(productId);
        expect(item.quantity).toBe(quantity);
    });
});
