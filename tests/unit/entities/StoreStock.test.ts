import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';

describe('StoreStock', () => {
    test('should create StoreStock with valid data', () => {
        const id = 1;
        const storeId = 2;
        const productId = 5;
        const quantity = 100;

        const storeStock = new StoreStock(id, storeId, productId, quantity);

        expect(storeStock.id).toBe(id);
        expect(storeStock.storeId).toBe(storeId);
        expect(storeStock.productId).toBe(productId);
        expect(storeStock.quantity).toBe(quantity);
    });

    test('should create StoreStock with zero quantity', () => {
        const id = 2;
        const storeId = 1;
        const productId = 3;
        const quantity = 0;

        const storeStock = new StoreStock(id, storeId, productId, quantity);

        expect(storeStock.id).toBe(id);
        expect(storeStock.storeId).toBe(storeId);
        expect(storeStock.productId).toBe(productId);
        expect(storeStock.quantity).toBe(quantity);
    });

    test('should create StoreStock with large quantity', () => {
        const id = 3;
        const storeId = 5;
        const productId = 10;
        const quantity = 9999;

        const storeStock = new StoreStock(id, storeId, productId, quantity);

        expect(storeStock.id).toBe(id);
        expect(storeStock.storeId).toBe(storeId);
        expect(storeStock.productId).toBe(productId);
        expect(storeStock.quantity).toBe(quantity);
    });

    test('should create StoreStock with different store and product IDs', () => {
        const id = 4;
        const storeId = 7;
        const productId = 15;
        const quantity = 50;

        const storeStock = new StoreStock(id, storeId, productId, quantity);

        expect(storeStock.id).toBe(id);
        expect(storeStock.storeId).toBe(storeId);
        expect(storeStock.productId).toBe(productId);
        expect(storeStock.quantity).toBe(quantity);
    });
});
