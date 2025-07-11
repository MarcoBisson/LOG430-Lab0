import { ReplenishmentRequest } from '../../../src/backend/domain/entities/ReplenishmentRequest';

describe('ReplenishmentRequest', () => {
    test('should create ReplenishmentRequest with valid data', () => {
        const id = 1;
        const productId = 1;
        const storeId = 2;
        const quantity = 50;
        const status = 'PENDING';
        const createdAt = new Date();

        const request = new ReplenishmentRequest(id, storeId, productId, quantity, status, createdAt);

        expect(request.id).toBe(id);
        expect(request.productId).toBe(productId);
        expect(request.storeId).toBe(storeId);
        expect(request.quantity).toBe(quantity);
        expect(request.status).toBe(status);
        expect(request.createdAt).toBe(createdAt);
    });

    test('should create ReplenishmentRequest with different status', () => {
        const id = 2;
        const productId = 5;
        const storeId = 3;
        const quantity = 100;
        const status = 'APPROVED';
        const createdAt = new Date('2023-01-01');

        const request = new ReplenishmentRequest(id, storeId, productId, quantity, status, createdAt);

        expect(request.id).toBe(id);
        expect(request.productId).toBe(productId);
        expect(request.storeId).toBe(storeId);
        expect(request.quantity).toBe(quantity);
        expect(request.status).toBe(status);
        expect(request.createdAt).toBe(createdAt);
    });

    test('should create ReplenishmentRequest with minimum quantity', () => {
        const id = 3;
        const productId = 10;
        const storeId = 1;
        const quantity = 1;
        const status = 'REJECTED';
        const createdAt = new Date('2023-06-15');

        const request = new ReplenishmentRequest(id, storeId, productId, quantity, status, createdAt);

        expect(request.id).toBe(id);
        expect(request.productId).toBe(productId);
        expect(request.storeId).toBe(storeId);
        expect(request.quantity).toBe(quantity);
        expect(request.status).toBe(status);
        expect(request.createdAt).toBe(createdAt);
    });

    test('should create ReplenishmentRequest with large quantity', () => {
        const id = 4;
        const productId = 7;
        const storeId = 4;
        const quantity = 1000;
        const status = 'PENDING';
        const createdAt = new Date('2024-12-01');

        const request = new ReplenishmentRequest(id, storeId, productId, quantity, status, createdAt);

        expect(request.id).toBe(id);
        expect(request.productId).toBe(productId);
        expect(request.storeId).toBe(storeId);
        expect(request.quantity).toBe(quantity);
        expect(request.status).toBe(status);
        expect(request.createdAt).toBe(createdAt);
    });
});
